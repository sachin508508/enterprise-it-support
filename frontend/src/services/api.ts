import * as SecureStore from 'expo-secure-store';

import { APP_CONFIG } from '../constants/config';

const API_BASE_URL = APP_CONFIG.API_BASE_URL;

const TOKEN_KEY = 'auth_token';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
  } = options;

  const authToken =
    token ??
    (await SecureStore.getItemAsync(TOKEN_KEY));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method,
        headers,
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );
  } catch {
    throw new Error(
      'Unable to connect to the IT Support server.'
    );
  }

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (
      typeof data === 'object' &&
      data !== null &&
      'detail' in data
    ) {
      const detail = (
        data as { detail: unknown }
      ).detail;

      if (typeof detail === 'string') {
        message = detail;
      } else if (
        typeof detail === 'object' &&
        detail !== null &&
        'message' in detail
      ) {
        message = String(
          (detail as { message: unknown }).message
        );
      }
    }

    throw new Error(message);
  }

  return data as T;
}