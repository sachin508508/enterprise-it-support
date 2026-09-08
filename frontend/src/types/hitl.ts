export type HITLStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export type HITLExecutionStatus =
  | 'executing'
  | 'successful'
  | 'failed'
  | null;

export interface HITLRequest {
  id: string;

  conversation_id: string;

  employee_id: string;

  reason: string;

  status: HITLStatus;

  reviewed_by: string | null;

  review_comment: string | null;

  created_at: string;

  reviewed_at: string | null;

  execution_status: HITLExecutionStatus;

  execution_result:
    | Record<string, unknown>
    | null;

  executed_at: string | null;
}

export interface HITLSubmitRequest {
  conversation_id: string;
  reason: string;
}

export interface HITLReviewRequest {
  status: 'approved' | 'rejected';
  review_comment: string | null;
}

export interface HITLResponse {
  status: string;
  hitl_request: HITLRequest;
}

export interface HITLListResponse {
  status: string;
  requests: HITLRequest[];
}