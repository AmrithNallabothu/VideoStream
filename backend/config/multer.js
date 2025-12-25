const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
if (!fs.existsSync('uploads/')) fs.mkdirSync('uploads/');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) cb(null, true);
  else cb(new Error('Only videos allowed!'), false);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });