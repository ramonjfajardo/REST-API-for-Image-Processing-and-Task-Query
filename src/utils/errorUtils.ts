import { CustomError } from '../middleware/errorHandler';

/**
 * Create a standardized error response
 */
export function createErrorResponse(message: string, statusCode: number = 500): CustomError {
  return new CustomError(message, statusCode);
}

/**
 * Handle and normalize errors from various sources
 */
export function normalizeError(error: unknown): CustomError {
  if (error instanceof CustomError) {
    return error;
  }

  if (error instanceof Error) {
    return new CustomError(error.message, 500, false);
  }

  return new CustomError('An unexpected error occurred', 500, false);
}

