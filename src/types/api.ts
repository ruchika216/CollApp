/**
 * API & SERVICE TYPES
 * Types for API responses, service interfaces, and external integrations
 */

// =====================================================================================
// GENERIC API RESPONSE TYPES
// =====================================================================================
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =====================================================================================
// AUTH API TYPES
// =====================================================================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'developer';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: {
    uid: string;
    email: string;
    name: string;
    role: 'admin' | 'developer';
    approved: boolean;
  };
  tokens: AuthTokens;
}

// =====================================================================================
// FILE UPLOAD TYPES
// =====================================================================================
export interface FileUploadRequest {
  file: File | any; // File object or React Native file object
  fileName: string;
  fileType: string;
  folder?: string;
}

export interface FileUploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface FileUploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'failed';
}

// =====================================================================================
// NOTIFICATION SERVICE TYPES
// =====================================================================================
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: {
    type: string;
    entityId: string;
    [key: string]: any;
  };
}

export interface EmailNotificationPayload {
  to: string | string[];
  subject: string;
  body: string;
  template?: string;
  templateData?: any;
}

// =====================================================================================
// MEETING SERVICE TYPES
// =====================================================================================
export interface MeetingReminderConfig {
  meetingId: string;
  reminderTimes: ('1day' | '1hour' | '15min')[];
  recipients: string[];
}

export interface MeetingLinkGenerator {
  platform: 'zoom' | 'teams' | 'meet' | 'custom';
  config: any;
}

// =====================================================================================
// FIREBASE/FIRESTORE TYPES
// =====================================================================================
export interface FirestoreDocument {
  id: string;
  [key: string]: any;
}

export interface FirestoreQuery {
  collection: string;
  where?: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains' | 'in' | 'array-contains-any';
    value: any;
  }>;
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  limit?: number;
  startAfter?: any;
}

export interface FirestoreBatch {
  operations: Array<{
    type: 'create' | 'update' | 'delete';
    collection: string;
    documentId: string;
    data?: any;
  }>;
}

// =====================================================================================
// GOOGLE AUTH TYPES
// =====================================================================================
export interface GoogleAuthConfig {
  webClientId: string;
  iosClientId?: string;
  androidClientId?: string;
}

export interface GoogleUserInfo {
  idToken: string;
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
    familyName?: string;
    givenName?: string;
  };
}

// =====================================================================================
// ANALYTICS & LOGGING TYPES
// =====================================================================================
export interface AnalyticsEvent {
  name: string;
  parameters?: {
    [key: string]: string | number | boolean;
  };
  userId?: string;
  timestamp?: string;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  timestamp: string;
  userId?: string;
  context?: string;
}

// =====================================================================================
// WEBHOOK TYPES
// =====================================================================================
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  source: string;
}

export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
  retryConfig?: {
    maxRetries: number;
    backoff: 'linear' | 'exponential';
  };
}