const fs = require('fs');
const Video = require('../models/Video');
const { processVideo } = require('../services/processingService'); 

// 1. Upload Video
exports.uploadVideo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No video uploaded' });

    // Safety Check for Auth
    if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: "User authentication failed" });
    }

    // Create DB Entry
    const video = await Video.create({
      originalName: req.body.title || req.file.originalname, 
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      userId: req.user.id, 
      status: 'processing' 
    });

    // Start Processing
    const io = req.app.get('io'); 
    processVideo(video._id, io);

    res.status(201).json({ success: true, message: 'Video uploaded successfully', video });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading video', error: error.message });
  }
};

// 2. Get All Videos
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: videos.length, videos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching videos', error: error.message });
  }
};

// 3. Stream Video
exports.streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    // Check if file physically exists
    if (!fs.existsSync(video.path)) {
      console.error(`File missing at path: ${video.path}`);
      return res.status(404).json({ message: 'Video file missing from server' });
    }

    const stat = fs.statSync(video.path);
    const fileSize = stat.size;
    const range = req.headers.range;
    const contentType = video.mimetype || 'video/mp4'; 

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(video.path, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
      };
      res.writeHead(200, head);
      fs.createReadStream(video.path).pipe(res);
    }
  } catch (error) {
    console.error('Streaming Error:', error);
    if (!res.headersSent) res.status(500).send(error.message);
  }
};

// 4. Delete Video
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user.id });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });

    if (fs.existsSync(video.path)) fs.unlinkSync(video.path); // Delete file
    await video.deleteOne(); // Delete DB entry

    res.status(200).json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};