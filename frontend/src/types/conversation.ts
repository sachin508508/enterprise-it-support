export type ConversationStatus =
  | 'successful'
  | 'failed'
  | 'denied'
  | 'pending';

export type ConversationQueryType =
  | 'RAG'
  | 'Action'
  | 'System Information'
  | 'Other';

export interface ConversationResponse {
  route?: string | null;
  data?: Record<string, unknown>;
}

export interface ConversationSummary {
  id: string;
  employee_id: string | null;
  query: string;
  query_type: ConversationQueryType;
  status: ConversationStatus;
  response?: ConversationResponse;
  response_json?: ConversationResponse;
  created_at: string;
  completed_at?: string | null;
}

export interface ConversationTimelineItem {
  title: string;
  description: string;
  status:
    | 'completed'
    | 'failed'
    | 'denied'
    | 'pending';
}

export interface ConversationHITL {
  id: string;
  conversation_id: string;
  employee_id: string;
  reason: string;

  status:
    | 'pending'
    | 'approved'
    | 'rejected';

  reviewed_by: string | null;
  review_comment: string | null;

  created_at: string;
  reviewed_at: string | null;

  execution_status:
    | 'executing'
    | 'successful'
    | 'failed'
    | null;

  execution_result:
    | Record<string, unknown>
    | null;

  executed_at: string | null;
}

export interface ConversationDetails {
  id: string;

  employee_id: string | null;

  query: string;

  query_type: ConversationQueryType;

  status: ConversationStatus;

  response: ConversationResponse;

  response_json?: ConversationResponse;

  raw_result: Record<string, unknown>;

  raw_result_json?: Record<string, unknown>;

  created_at: string;

  completed_at: string | null;

  timeline: ConversationTimelineItem[];

  hitl_request?: ConversationHITL | null;
}

export interface ConversationListResponse {
  status: string;
  conversations: ConversationSummary[];
}

export interface ConversationDetailsResponse {
  status: string;
  conversation: ConversationDetails;
}