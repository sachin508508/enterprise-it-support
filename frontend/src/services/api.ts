import { APP_CONFIG } from '../constants/config';

export const API_BASE_URL = APP_CONFIG.API_BASE_URL;

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...headers,
      },
    },
  );

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMessage =
      typeof data === 'object' &&
      data !== null &&
      'detail' in data &&
      typeof data.detail === 'string'
        ? data.detail
        : 'Something went wrong. Please try again.';

    throw new Error(errorMessage);
  }

  return data as T;
}