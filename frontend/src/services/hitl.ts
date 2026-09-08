import { apiRequest } from './api';

import {
  HITLListResponse,
  HITLResponse,
  HITLReviewRequest,
  HITLSubmitRequest,
} from '../types/hitl';


export async function submitHITLRequest(
  conversationId: string,
  reason: string
): Promise<HITLResponse> {

  const body: HITLSubmitRequest = {
    conversation_id: conversationId,
    reason: reason.trim(),
  };

  return apiRequest<HITLResponse>(
    '/api/hitl',
    {
      method: 'POST',
      body,
    }
  );
}


export async function getMyHITLRequests(): Promise<HITLListResponse> {

  return apiRequest<HITLListResponse>(
    '/api/hitl/my'
  );
}


export async function getHITLRequest(
  hitlId: string
): Promise<HITLResponse> {

  return apiRequest<HITLResponse>(
    `/api/hitl/${hitlId}`
  );
}


export async function getAdminHITLQueue(
  status?: string
): Promise<HITLListResponse> {

  const endpoint = status
    ? `/api/hitl/admin/queue?status=${encodeURIComponent(status)}`
    : '/api/hitl/admin/queue';

  return apiRequest<HITLListResponse>(
    endpoint
  );
}


export async function getAdminHITLRequest(
  hitlId: string
): Promise<HITLResponse> {

  return apiRequest<HITLResponse>(
    `/api/hitl/admin/${hitlId}`
  );
}


export async function reviewHITLRequest(
  hitlId: string,
  status: 'approved' | 'rejected',
  reviewComment?: string
): Promise<HITLResponse> {

  const body: HITLReviewRequest = {
    status,
    review_comment:
      reviewComment?.trim() || null,
  };

  return apiRequest<HITLResponse>(
    `/api/hitl/admin/${hitlId}`,
    {
      method: 'PATCH',
      body,
    }
  );
}


export async function executeHITLRequest(
  hitlId: string
): Promise<HITLResponse> {

  return apiRequest<HITLResponse>(
    `/api/hitl/admin/${hitlId}/execute`,
    {
      method: 'POST',
    }
  );
}


/**
 * Returns the HITL request associated with a conversation.
 */
export async function getHITLForConversation(
  conversationId: string
) {

  const response =
    await getMyHITLRequests();

  return response.requests.find(
    (request) =>
      request.conversation_id ===
      conversationId
  ) ?? null;
}


/**
 * Determines whether the conversation currently
 * has an active HITL process.
 *
 * Rejected HITLs do not block another submission.
 *
 * Once an approved HITL has finished executing,
 * it is considered processed and therefore does
 * not block another submission.
 */
export function isHITLActive(
  hitl: {
    status: string;
    execution_status:
      | string
      | null;
  } | null
): boolean {

  if (!hitl) {
    return false;
  }

  if (hitl.status === 'pending') {
    return true;
  }

  if (
    hitl.status === 'approved' &&
    (
      hitl.execution_status === null ||
      hitl.execution_status === 'executing'
    )
  ) {
    return true;
  }

  return false;
}