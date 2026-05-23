/**
 * @file errorHandler.js
 * @description Middleware xử lý lỗi toàn cục
 * Single Responsibility: Catch tất cả lỗi và format response
 * @category Middleware
 */

const { formatErrorResponse } = require('../services/errorService');
const { log } = require('../services/helpers');

/**
 * Global error handler middleware
 * Phải đặt ở dưới cùng trong express app
 */
function errorHandler(err, req, res, next) {
  log('ERROR', `${req.method} ${req.path}`);
  log('ERROR', err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const errorResponse = formatErrorResponse(err);
  
  res.status(errorResponse.status).json({
    success: false,
    ...errorResponse
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    status: 404,
    message: 'Route not found',
    path: req.path
  });
}

/**
 * Async error wrapper - để catch error trong async/await
 * Sử dụng: router.get('/path', asyncHandler(controllerFunction))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
