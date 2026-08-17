/**
 * @file errorService.js
 * @description Service xử lý lỗi tập trung
 * Single Responsibility: Quản lý tất cả error handling
 * @category Service
 */

/**
 * API Error class
 */
class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Validation Error (400)
 */
function badRequest(message, details = null) {
  return new ApiError(400, message, details);
}

/**
 * Unauthorized Error (401)
 */
function unauthorized(message = 'Chưa được xác thực') {
  return new ApiError(401, message);
}

/**
 * Forbidden Error (403)
 */
function forbidden(message = 'Bạn không có quyền truy cập') {
  return new ApiError(403, message);
}

/**
 * Not Found Error (404)
 */
function notFound(message, details = null) {
  return new ApiError(404, message, details);
}

/**
 * Conflict Error (409)
 */
function conflict(message, details = null) {
  return new ApiError(409, message, details);
}

/**
 * Internal Server Error (500)
 */
function internalServerError(message = 'Lỗi server', details = null) {
  return new ApiError(500, message, details);
}

/**
 * Format error response
 * @param {Error} error - Error object
 * @returns {object} Formatted error response
 */
function formatErrorResponse(error) {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      message: error.message,
      ...(error.details && { details: error.details })
    };
  }

  return {
    status: 500,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  };
}

/**
 * Handle database errors
 * @param {Error} error - Database error
 * @returns {ApiError}
 */
function handleDatabaseError(error) {
  console.error('Database error:', error);

  if (error.code === 'ER_DUP_ENTRY') {
    return conflict('Dữ liệu đã tồn tại');
  }
  if (error.code === 'ER_NO_REFERENCED_ROW') {
    return badRequest('Tham chiếu không hợp lệ');
  }
  if (error.code === 'ER_PARSE_ERROR') {
    return internalServerError('Lỗi cú pháp SQL');
  }

  return internalServerError('Lỗi cơ sở dữ liệu');
}

/**
 * Handle file upload errors
 * @param {Error} error - Upload error
 * @returns {ApiError}
 */
function handleUploadError(error) {
  console.error('Upload error:', error);

  if (error.name === 'MulterError') {
    return badRequest(`Lỗi upload: ${error.message}`);
  }

  return internalServerError('Lỗi upload file');
}

/**
 * Log error
 * @param {string} context - Ngữ cảnh (tên hàm, route, v.v.)
 * @param {Error} error - Error object
 */
function logError(context, error) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  console.error(`[${timestamp}] ${context}:`, errorMessage);
  
  if (process.env.NODE_ENV === 'development' && error.stack) {
    console.error(error.stack);
  }
}

module.exports = {
  ApiError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalServerError,
  formatErrorResponse,
  handleDatabaseError,
  handleUploadError,
  logError,
};
