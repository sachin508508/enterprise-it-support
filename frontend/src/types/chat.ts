export type MessageRole =
  | 'user'
  | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  query: string;
}

export interface BackendChatResponse {
  request_id: string;
  status:
    | 'successful'
    | 'failed'
    | 'denied'
    | 'pending';

  query_type:
    | 'RAG'
    | 'Action'
    | 'System Information'
    | 'Other';

  response: {
    route: string | null;
    data: Record<string, unknown>;
  };
}