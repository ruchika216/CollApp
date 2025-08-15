/**
 * BASE API SERVICE
 * Core API functionality and configuration
 */

import { ApiResponse, ApiError, PaginatedResponse } from '../../types/api';

// =====================================================================================
// API CONFIGURATION
// =====================================================================================
export const API_CONFIG = {
  BASE_URL: process.env.REACT_NATIVE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// =====================================================================================
// API ERROR HANDLING
// =====================================================================================
export class ApiServiceError extends Error {
  code: string;
  statusCode?: number;
  details?: any;

  constructor(message: string, code: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ApiServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const handleApiError = (error: any): ApiServiceError => {
  if (error instanceof ApiServiceError) {
    return error;
  }

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return new ApiServiceError(
      data?.message || 'Server error occurred',
      data?.code || 'SERVER_ERROR',
      status,
      data
    );
  }

  if (error.request) {
    // Request was made but no response received
    return new ApiServiceError(
      'Network error - no response received',
      'NETWORK_ERROR',
      undefined,
      error.request
    );
  }

  // Something else happened
  return new ApiServiceError(
    error.message || 'Unknown error occurred',
    'UNKNOWN_ERROR'
  );
};

// =====================================================================================
// BASE API CLIENT
// =====================================================================================
export class BaseApiService {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: Partial<typeof API_CONFIG> = {}) {
    this.baseURL = config.BASE_URL || API_CONFIG.BASE_URL;
    this.timeout = config.TIMEOUT || API_CONFIG.TIMEOUT;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.headers['Authorization'];
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiServiceError(
          data.message || 'Request failed',
          data.code || 'REQUEST_FAILED',
          response.status,
          data
        );
      }

      return {
        data: data.data || data,
        success: true,
        message: data.message,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.makeRequest(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest(endpoint, {
      method: 'DELETE',
    });
  }
}

// =====================================================================================
// SINGLETON API CLIENT
// =====================================================================================
export const apiClient = new BaseApiService();

// =====================================================================================
// UTILITY FUNCTIONS
// =====================================================================================
export const isPaginatedResponse = <T>(
  response: ApiResponse<T> | PaginatedResponse<T>
): response is PaginatedResponse<T> => {
  return 'pagination' in response;
};

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts: number = API_CONFIG.RETRY_ATTEMPTS,
  delay: number = API_CONFIG.RETRY_DELAY
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, attempts - 1, delay * 2);
  }
};