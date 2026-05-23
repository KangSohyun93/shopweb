/**
 * @file validationService.js
 * @description Service xử lý validation cho toàn bộ dự án
 * Single Responsibility: Chỉ xác thực dữ liệu
 * @category Service
 */

/**
 * Validate variant data
 * @param {object} variant - Dữ liệu variant
 * @returns {object} { isValid: boolean, errors: string[] }
 */
function validateVariant(variant) {
  const errors = [];

  if (!variant.sku) errors.push('SKU không được để trống');
  if (!variant.size) errors.push('Size không được để trống');
  if (!variant.price || variant.price <= 0) errors.push('Giá phải lớn hơn 0');
  if (variant.stock_quantity === undefined || variant.stock_quantity < 0) {
    errors.push('Số lượng tồn kho không được âm');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate tất cả variants
 * @param {array} variants - Mảng variants
 * @returns {object} { isValid: boolean, errors: string[] }
 */
function validateVariants(variants) {
  const allErrors = [];

  if (!variants || !Array.isArray(variants) || variants.length === 0) {
    return {
      isValid: false,
      errors: ['Phải có ít nhất một variant']
    };
  }

  variants.forEach((variant, index) => {
    const { isValid, errors } = validateVariant(variant);
    if (!isValid) {
      errors.forEach(err => {
        allErrors.push(`Variant ${index + 1}: ${err}`);
      });
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

/**
 * Validate product creation data
 * @param {object} data - Product data
 * @returns {object} { isValid: boolean, errors: string[] }
 */
function validateProductCreation(data) {
  const errors = [];

  if (!data.name) errors.push('Tên sản phẩm không được để trống');
  if (!data.variants || !Array.isArray(data.variants)) {
    errors.push('Variants không hợp lệ');
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Validate variants
  const variantValidation = validateVariants(data.variants);
  return variantValidation;
}

/**
 * Validate user creation data
 * @param {object} data - User data
 * @returns {object} { isValid: boolean, errors: string[] }
 */
function validateUserCreation(data) {
  const errors = [];

  if (!data.username) errors.push('Username không được để trống');
  if (!data.email || !isValidEmail(data.email)) errors.push('Email không hợp lệ');
  if (!data.password || data.password.length < 6) {
    errors.push('Password phải tối thiểu 6 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate email format
 * @param {string} email - Email cần validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate order data
 * @param {object} data - Order data
 * @returns {object} { isValid: boolean, errors: string[] }
 */
function validateOrderCreation(data) {
  const errors = [];

  if (!data.user_id) errors.push('User ID không được để trống');
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('Đơn hàng phải có ít nhất một sản phẩm');
  }
  if (data.total_amount === undefined || data.total_amount <= 0) {
    errors.push('Tổng tiền phải lớn hơn 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate pagination params
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số item mỗi trang
 * @returns {object} { page: number, limit: number }
 */
function validatePagination(page = 1, limit = 10) {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));

  return {
    page: validPage,
    limit: validLimit
  };
}

module.exports = {
  validateVariant,
  validateVariants,
  validateProductCreation,
  validateUserCreation,
  validateOrderCreation,
  validatePagination,
  isValidEmail,
};
