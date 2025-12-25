const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const videoController = require('../controllers/videoController');

// --- 1. SETUP MULTER (File Upload Logic) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure this folder exists!
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `video-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB Limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// --- 2. AUTH MIDDLEWARE ---
// We need this to get req.user.id
// If you don't have this file, you can temporarily remove 'protect' from the routes below
const { protect } = require('../middleware/auth'); 

// --- 3. DEFINE ROUTES (The "Map") ---

// Upload Route
router.post('/upload', protect, upload.single('video'), videoController.uploadVideo);

// Get All Videos
router.get('/', protect, videoController.getAllVideos);

// Stream Video (THIS IS THE MISSING LINK!) ⚠️
router.get('/stream/:id', videoController.streamVideo); 

// Delete Video
router.delete('/:id', protect, videoController.deleteVideo);

module.exports = router;