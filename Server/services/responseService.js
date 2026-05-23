/**
 * @file responseService.js
 * @description Service xử lý response tập trung
 * Single Responsibility: Format và gửi response cho client
 * @category Service
 */

/**
 * Success response
 * @param {object} data - Dữ liệu response
 * @param {string} message - Message
 * @returns {object}
 */
function successResponse(data, message = null) {
  return {
    success: true,
    data,
    ...(message && { message })
  };
}

/**
 * Paginated success response
 * @param {array} items - Mảng items
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số item mỗi trang
 * @param {number} total - Tổng items
 * @param {string} message - Message
 * @returns {object}
 */
function paginatedResponse(items, page, limit, total, message = null) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    },
    ...(message && { message })
  };
}

/**
 * Created response (201)
 * @param {object} data - Dữ liệu vừa tạo
 * @param {string} message - Message
 * @returns {object}
 */
function createdResponse(data, message = 'Tạo thành công') {
  return {
    success: true,
    message,
    data
  };
}

/**
 * Updated response
 * @param {object} data - Dữ liệu vừa update
 * @param {string} message - Message
 * @returns {object}
 */
function updatedResponse(data, message = 'Cập nhật thành công') {
  return {
    success: true,
    message,
    data
  };
}

/**
 * Deleted response
 * @param {string} message - Message
 * @returns {object}
 */
function deletedResponse(message = 'Xóa thành công') {
  return {
    success: true,
    message
  };
}

/**
 * Error response
 * @param {string} message - Error message
 * @param {*} details - Chi tiết lỗi
 * @returns {object}
 */
function errorResponse(message, details = null) {
  return {
    success: false,
    message,
    ...(details && { details })
  };
}

/**
 * Validation error response
 * @param {array} errors - Mảng errors
 * @returns {object}
 */
function validationErrorResponse(errors) {
  return {
    success: false,
    message: 'Validation failed',
    errors: Array.isArray(errors) ? errors : [errors]
  };
}

/**
 * Send JSON response
 * @param {object} res - Response object
 * @param {number} status - HTTP status
 * @param {object} data - Data để gửi
 */
function sendJson(res, status, data) {
  res.status(status).json(data);
}

/**
 * Send success JSON
 * @param {object} res - Response object
 * @param {*} data - Data
 * @param {number} status - HTTP status (mặc định 200)
 */
function sendSuccess(res, data, status = 200) {
  sendJson(res, status, successResponse(data));
}

/**
 * Send error JSON
 * @param {object} res - Response object
 * @param {number} status - HTTP status
 * @param {string} message - Error message
 * @param {*} details - Details
 */
function sendError(res, status, message, details = null) {
  sendJson(res, status, errorResponse(message, details));
}

module.exports = {
  successResponse,
  paginatedResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  errorResponse,
  validationErrorResponse,
  sendJson,
  sendSuccess,
  sendError,
};
