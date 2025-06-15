const multer = require('multer');
const path = require('path');

// Lưu file vào memory thay vì disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // Giới hạn 1MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh JPEG, JPG, PNG!'));
  },
});

module.exports = upload; // Export instance của multer