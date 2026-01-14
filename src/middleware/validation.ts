import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';
import { isURL } from '../utils/fileUtils';
import * as path from 'path';

/**
 * Validation middleware factory
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await Promise.all(validations.map((validation) => validation.run(req)));

      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const errorMessages = errors.array().map((err) => err.msg).join(', ');
      return next(new CustomError(errorMessages, 400));
    } catch (error) {
      return next(error);
    }
  };
};

/**
 * Custom validator to check if image path is valid (URL or local file path format)
 */
const validateImagePath = async (imagePath: string): Promise<boolean> => {
  // Check if it's a URL
  if (isURL(imagePath)) {
    // Validate URL format
    try {
      const url = new URL(imagePath);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('URL must use http or https protocol');
      }
      // Basic URL validation - actual accessibility will be checked during processing
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('protocol')) {
        throw error;
      }
      throw new Error('Invalid URL format');
    }
  }

  // Validate local file path format (don't check existence here - let processing handle it)
  try {
    // Prevent path traversal attacks
    const normalizedPath = path.normalize(imagePath);
    if (normalizedPath.includes('..')) {
      throw new Error('Invalid file path: path traversal detected');
    }

    // Validate path format (must be a valid path string)
    if (!normalizedPath || normalizedPath.trim().length === 0) {
      throw new Error('File path cannot be empty');
    }

    // Basic path validation - actual file existence will be checked during processing
    return true;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Invalid file path format');
  }
};

/**
 * Validate task creation request
 */
export const validateCreateTask = validate([
  body('imagePath')
    .notEmpty()
    .withMessage('imagePath is required')
    .isString()
    .withMessage('imagePath must be a string')
    .trim()
    .isLength({ min: 1, max: 2048 })
    .withMessage('imagePath must be between 1 and 2048 characters')
    .custom(async (value) => {
      try {
        await validateImagePath(value);
        return true;
      } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Invalid image path');
      }
    }),
]);

/**
 * Validate task ID parameter
 */
export const validateTaskId = validate([
  param('taskId')
    .notEmpty()
    .withMessage('taskId is required')
    .isMongoId()
    .withMessage('taskId must be a valid MongoDB ObjectId'),
]);

