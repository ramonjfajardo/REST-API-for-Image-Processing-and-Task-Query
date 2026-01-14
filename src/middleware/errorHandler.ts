import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle MongoDB cast errors (invalid ObjectId)
 */
function handleCastErrorDB(err: mongoose.Error.CastError): CustomError {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new CustomError(message, 400);
}

/**
 * Handle MongoDB duplicate field errors
 */
function handleDuplicateFieldsDB(err: any): CustomError {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new CustomError(message, 400);
}

/**
 * Handle MongoDB validation errors
 */
function handleValidationErrorDB(err: mongoose.Error.ValidationError): CustomError {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new CustomError(message, 400);
}

/**
 * Centralized error handler middleware
 */
export function errorHandler(
  err: AppError | mongoose.Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let error: CustomError;

  // Handle specific error types
  if (err instanceof mongoose.Error.CastError) {
    error = handleCastErrorDB(err);
  } else if ((err as any).code === 11000) {
    error = handleDuplicateFieldsDB(err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationErrorDB(err);
  } else if (err instanceof CustomError) {
    error = err;
  } else {
    // Unknown error
    const statusCode = (err as AppError).statusCode || 500;
    const message = err.message || 'Internal Server Error';
    error = new CustomError(message, statusCode, false);
  }

  // Log error
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
    });
  } else {
    // Production logging (can be enhanced with proper logging service)
    if (error.statusCode >= 500) {
      console.error('Server Error:', {
        message: error.message,
        statusCode: error.statusCode,
        url: req.originalUrl,
        method: req.method,
      });
    }
  }

  // Send error response
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      error: err,
    }),
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = new CustomError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}

/**
 * Async error wrapper - catches errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

