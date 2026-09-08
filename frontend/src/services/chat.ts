import { apiRequest } from './api';

export interface ChatResponse {
  request_id: string;
  status: string;
  query_type: string;
  response: {
    route: string | null;
    data: Record<string, unknown>;
  };
}

export async function submitRequest(
  query: string
): Promise<ChatResponse> {
  return apiRequest<ChatResponse>(
    '/api/chat',
    {
      method: 'POST',
      body: {
        query,
      },
    }
  );
}