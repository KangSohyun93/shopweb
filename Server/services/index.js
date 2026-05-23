/**
 * @file index.js
 * @description Entry point để nhập tất cả các service
 * Giúp dễ dàng import từ bên ngoài mà không cần gõ từng file
 * @category Service Index
 */

const constants = require('./constants');
const helpers = require('./helpers');
const cloudinaryService = require('./cloudinaryService');
const databaseService = require('./databaseService');
const fileSystemService = require('./fileSystemService');
const productImageService = require('./productImageService');
const validationService = require('./validationService');
const errorService = require('./errorService');
const responseService = require('./responseService');

module.exports = {
  // Constants
  UPLOAD_CONFIG: constants.UPLOAD_CONFIG,
  DATABASE_CONFIG: constants.DATABASE_CONFIG,
  LOG_LEVELS: constants.LOG_LEVELS,

  // Helpers
  sleep: helpers.sleep,
  log: helpers.log,
  sanitizeFolderName: helpers.sanitizeFolderName,
  folderNameToProductName: helpers.folderNameToProductName,
  isImageFile: helpers.isImageFile,
  formatNumber: helpers.formatNumber,

  // Legacy Services (Image Upload)
  cloudinaryService,
  databaseService,
  fileSystemService,
  productImageService,

  // New Services (Validation, Error, Response)
  validationService,
  errorService,
  responseService,
};
