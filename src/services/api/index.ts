/**
 * API SERVICES INDEX
 * Centralized exports for all API services
 */

// Base API functionality
export * from './base';
export { BaseApiService, apiClient, API_CONFIG, ApiServiceError } from './base';

// Project API
export * from './projects';
export { ProjectApiService, projectApiService } from './projects';

// Additional API services can be added here
// export * from './tasks';
// export * from './meetings';
// export * from './reports';
// export * from './users';