import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';

/**
 * Validation middleware factory
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    throw new CustomError(errorMessages, 400);
  };
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
    .isLength({ min: 1 })
    .withMessage('imagePath cannot be empty'),
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

