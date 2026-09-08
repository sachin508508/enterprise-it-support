import { apiRequest } from './api';

import {
  ConversationDetailsResponse,
  ConversationListResponse,
} from '../types/conversation';

export async function getConversations(): Promise<
  ConversationListResponse
> {
  return apiRequest<ConversationListResponse>(
    '/api/conversations'
  );
}

export async function getConversation(
  conversationId: string
): Promise<ConversationDetailsResponse> {
  return apiRequest<ConversationDetailsResponse>(
    `/api/conversations/${conversationId}`
  );
}