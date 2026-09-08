import { ConversationQueryType } from '../types/conversation';

export interface FormattedAIResponse {
  title: string;
  message: string;
}

const INTERNAL_KEYS = new Set([
  'status',
  'route',
  'type',
  'tool',
  'tool_name',
  'arguments',
  'input_schema',
  'raw_result',
  'raw_result_json',
  'error_type',
  'needs_action',
  'sources',
  'metadata',
]);

function cleanString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Extract useful text from arbitrary nested backend data.
 *
 * This intentionally ignores internal implementation
 * details such as tool names, arguments and routes.
 */
function extractText(
  value: unknown,
  depth = 0
): string {
  if (depth > 6 || value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    const parts: string[] = [];

    for (const item of value) {
      const text = extractText(item, depth + 1);

      if (text) {
        parts.push(text);
      }
    }

    return parts.join('\n');
  }

  if (typeof value === 'object') {
    const object = value as Record<string, unknown>;

    const preferredKeys = [
      'summary',
      'answer',
      'message',
      'response',
      'text',
      'description',
      'detail',
      'name',
      'content',
    ];

    /*
     * Prefer explicitly human-readable fields.
     */
    for (const key of preferredKeys) {
      if (!(key in object)) {
        continue;
      }

      const text = extractText(
        object[key],
        depth + 1
      );

      if (text) {
        return text;
      }
    }

    /*
     * Handle structured content blocks.
     */
    const parts: string[] = [];

    for (const [key, item] of Object.entries(object)) {
      if (INTERNAL_KEYS.has(key)) {
        continue;
      }

      if (
        key === 'id' &&
        typeof item === 'string'
      ) {
        continue;
      }

      const text = extractText(
        item,
        depth + 1
      );

      if (!text) {
        continue;
      }

      /*
       * Avoid creating ugly "Content: ..."
       * output for already-readable strings.
       */
      if (
        typeof item === 'string' &&
        !key.includes('_')
      ) {
        parts.push(text);
      } else {
        parts.push(
          `${humanizeKey(key)}: ${text}`
        );
      }
    }

    return parts.join('\n');
  }

  return '';
}

/**
 * Special handling for RAG responses.
 */
function formatRAGResponse(
  data: Record<string, unknown>
): FormattedAIResponse {
  const title =
    cleanString(data.title) ||
    'AI Response';

  const summary =
    cleanString(data.summary);

  if (summary) {
    return {
      title,
      message: summary,
    };
  }

  if (Array.isArray(data.content)) {
    const parts: string[] = [];

    for (const block of data.content) {
      if (
        typeof block !== 'object' ||
        block === null
      ) {
        continue;
      }

      const contentBlock =
        block as Record<string, unknown>;

      const text =
        cleanString(contentBlock.text);

      if (text) {
        parts.push(text);
      }

      if (
        Array.isArray(
          contentBlock.items
        )
      ) {
        for (const item of contentBlock.items) {
          const itemText =
            cleanString(item);

          if (itemText) {
            parts.push(`• ${itemText}`);
          }
        }
      }
    }

    if (parts.length > 0) {
      return {
        title,
        message: parts.join('\n'),
      };
    }
  }

  return {
    title,
    message:
      'The request was processed successfully.',
  };
}

/**
 * Special handling for Jira / MCP responses.
 *
 * The MCP result can contain deeply nested
 * Jira API information. We expose only useful
 * project information.
 */
function formatMCPResponse(
  data: Record<string, unknown>
): FormattedAIResponse {
  const result = data.result;

  if (
    typeof result === 'object' &&
    result !== null
  ) {
    const resultObject =
      result as Record<string, unknown>;

    /*
     * If MCP itself returned a readable message,
     * use that first.
     */
    const directMessageKeys = [
      'message',
      'summary',
      'response',
      'description',
      'detail',
    ];

    for (const key of directMessageKeys) {
      const value =
        resultObject[key];

      const text =
        cleanString(value);

      if (text) {
        return {
          title: 'Action Result',
          message: text,
        };
      }
    }

    /*
     * Jira project information.
     */
    const projectParts: string[] = [];

    const projectFields: Array<
      [string, string]
    > = [
      ['key', 'Project Key'],
      ['name', 'Project Name'],
      ['projectTypeKey', 'Project Type'],
      ['projectType', 'Project Type'],
      ['description', 'Description'],
      ['lead', 'Project Lead'],
      ['url', 'Project URL'],
    ];

    for (const [field, label] of projectFields) {
      const value =
        resultObject[field];

      if (
        typeof value === 'string' &&
        value.trim()
      ) {
        projectParts.push(
          `${label}: ${value.trim()}`
        );
      }
    }

    /*
     * Handle nested lead object.
     */
    if (
      typeof resultObject.lead === 'object' &&
      resultObject.lead !== null
    ) {
      const lead =
        resultObject.lead as Record<
          string,
          unknown
        >;

      const leadName =
        cleanString(lead.displayName) ||
        cleanString(lead.name) ||
        cleanString(lead.emailAddress);

      if (leadName) {
        projectParts.push(
          `Project Lead: ${leadName}`
        );
      }
    }

    if (projectParts.length > 0) {
      return {
        title: 'Jira Project Details',
        message:
          projectParts.join('\n'),
      };
    }

    /*
     * Generic MCP result.
     */
    const readable =
      extractText(result);

    if (readable) {
      return {
        title: 'Action Result',
        message: readable,
      };
    }
  }

  /*
   * MCP may return a direct message.
   */
  const directMessage =
    cleanString(data.message) ||
    cleanString(data.response) ||
    cleanString(data.summary);

  if (directMessage) {
    return {
      title: 'Action Result',
      message: directMessage,
    };
  }

  return {
    title: 'Action Result',
    message:
      'The requested action was completed successfully.',
  };
}

/**
 * Format database / system-information responses.
 */
function formatSystemInformation(
  data: Record<string, unknown>
): FormattedAIResponse {
  const preferredKeys = [
    'message',
    'response',
    'summary',
    'answer',
    'text',
  ];

  for (const key of preferredKeys) {
    const value =
      data[key];

    const text =
      cleanString(value);

    if (text) {
      return {
        title: 'System Information',
        message: text,
      };
    }
  }

  /*
   * DB tool responses may look like:
   *
   * [
   *   {
   *     tool: "...",
   *     result: {
   *       employee_id: "...",
   *       name: "..."
   *     }
   *   }
   * ]
   *
   * At this point the formatter receives the
   * selected result object, so format it as
   * readable fields.
   */
  const readable =
    extractText(data);

  if (readable) {
    return {
      title: 'System Information',
      message: readable,
    };
  }

  return {
    title: 'System Information',
    message:
      'The requested information was retrieved successfully.',
  };
}

/**
 * Main formatter used by every screen.
 */
export function formatAIResponse(
  response: unknown,
  queryType?: ConversationQueryType
): FormattedAIResponse {
  if (
    response === null ||
    response === undefined
  ) {
    return {
      title: 'AI Response',
      message: 'No response available.',
    };
  }

  /*
   * Direct string response.
   */
  if (typeof response === 'string') {
    return {
      title:
        queryType === 'Action'
          ? 'Action Result'
          : queryType === 'System Information'
            ? 'System Information'
            : 'AI Response',
      message: response.trim(),
    };
  }

  /*
   * Array responses.
   *
   * This is especially important for DB
   * tool-calling results.
   */
  if (Array.isArray(response)) {
    for (const item of response) {
      if (
        typeof item !== 'object' ||
        item === null
      ) {
        continue;
      }

      const object =
        item as Record<string, unknown>;

      /*
       * DB tool result:
       * { tool, result }
       */
      if ('result' in object) {
        const result =
          object.result;

        if (
          queryType ===
          'System Information'
        ) {
          return formatSystemInformation(
            typeof result === 'object' &&
              result !== null
              ? result as Record<
                  string,
                  unknown
                >
              : { message: String(result) }
          );
        }

        if (
          queryType === 'Action'
        ) {
          return formatMCPResponse(
            object
          );
        }
      }

      const formatted =
        formatAIResponse(
          object,
          queryType
        );

      if (
        formatted.message &&
        formatted.message !==
          'No response available.'
      ) {
        return formatted;
      }
    }

    const readable =
      extractText(response);

    return {
      title:
        queryType === 'Action'
          ? 'Action Result'
          : queryType === 'System Information'
            ? 'System Information'
            : 'AI Response',
      message:
        readable ||
        'The request was processed successfully.',
    };
  }

  /*
   * Object response.
   */
  if (typeof response === 'object') {
    const data =
      response as Record<string, unknown>;

    /*
     * Backend response wrapper:
     *
     * {
     *   route: "mcp",
     *   data: {...}
     * }
     */
    const innerData =
      data.data;

    if (
      typeof innerData === 'object' &&
      innerData !== null
    ) {
      return formatAIResponse(
        innerData,
        queryType
      );
    }

    /*
     * RAG.
     */
    if (
      data.type === 'rag_response' ||
      queryType === 'RAG'
    ) {
      return formatRAGResponse(
        data
      );
    }

    /*
     * MCP / Action.
     */
    if (
      queryType === 'Action' ||
      'tool' in data ||
      'tool_name' in data
    ) {
      return formatMCPResponse(
        data
      );
    }

    /*
     * System Information / DB.
     */
    if (
      queryType ===
      'System Information'
    ) {
      return formatSystemInformation(
        data
      );
    }

    /*
     * Generic readable response.
     */
    const readable =
      extractText(data);

    if (readable) {
      return {
        title:
          cleanString(data.title) ||
          'AI Response',
        message: readable,
      };
    }
  }

  return {
    title:
      queryType === 'Action'
        ? 'Action Result'
        : queryType === 'System Information'
          ? 'System Information'
          : 'AI Response',
    message:
      'The request was processed successfully.',
  };
}