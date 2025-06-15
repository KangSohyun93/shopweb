const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: 'dohkcbl1l', // Thay bằng Cloud name của bạn
  api_key: '875331825326235',       // Thay bằng API Key
  api_secret: 'Wlqid3TAPySGzHqBcdIVR-fOvE4', // Thay bằng API Secret
});

module.exports = cloudinary;