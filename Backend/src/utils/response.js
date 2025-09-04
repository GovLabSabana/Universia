export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res, error = 'Something went wrong', message = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error,
    message: message || error
  });
};

export const sendValidationError = (res, message = 'Validation failed') => {
  return sendError(res, 'VALIDATION_ERROR', message, 400);
};

export const sendAuthError = (res, message = 'Authentication required') => {
  return sendError(res, 'AUTHENTICATION_ERROR', message, 401);
};

export const sendNotFoundError = (res, message = 'Resource not found') => {
  return sendError(res, 'NOT_FOUND', message, 404);
};