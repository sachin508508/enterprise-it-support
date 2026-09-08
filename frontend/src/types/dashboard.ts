export interface DashboardActivity {
  id: string;
  query: string;
  query_type:
    | 'RAG'
    | 'Action'
    | 'System Information'
    | 'Other';
  status:
    | 'successful'
    | 'failed'
    | 'denied'
    | 'pending';
  created_at: string | null;
}

export interface DashboardData {
  status: string;

  total_queries: number;

  rag_queries: number;

  action_queries: number;

  system_information_queries: number;

  successful: number;

  failed: number;

  denied: number;

  hitl_pending: number;

  recent_activity: DashboardActivity[];
}