const ffmpeg = require('fluent-ffmpeg');
const Video = require('../models/Video');
const path = require('path');

exports.processVideo = async (videoId, io) => {
  try {
    const video = await Video.findById(videoId);
    if (!video) return;

    console.log(`🎬 Starting processing for: ${video.filename}`);
    
    // Notify client: Processing Started
    io.emit('video-status', { videoId, status: 'processing', progress: 0 });

    // 1. Get Video Metadata (Duration)
    // We default to 60s if ffmpeg fails (common in dev environments)
    let duration = 60; 
    
    ffmpeg.ffprobe(video.path, async (err, metadata) => {
      if (!err && metadata) {
        duration = metadata.format.duration;
      }

      // 2. Simulate Processing with Progress Updates (0% to 100%)
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 20;
        
        // Emit live progress to the frontend
        io.emit('video-status', { videoId, status: 'processing', progress });
        console.log(`Processing ${video._id}: ${progress}%`);

        if (progress >= 100) {
          clearInterval(interval);
          
          // 3. Mock AI Analysis (Randomly flag 30% of videos)
          const isFlagged = Math.random() < 0.3;
          const sensitivityStatus = isFlagged ? 'flagged' : 'safe';

          // 4. Update Database
          video.status = 'completed';
          video.sensitivityStatus = sensitivityStatus;
          video.duration = duration;
          await video.save();

          console.log(`✅ Processing complete. Status: ${sensitivityStatus}`);

          // Notify client: Done
          io.emit('video-status', { 
            videoId, 
            status: 'completed', 
            sensitivityStatus,
            progress: 100 
          });
        }
      }, 1000); // Update every 1 second
    });

  } catch (error) {
    console.error('Processing error:', error);
    // Handle error state
    await Video.findByIdAndUpdate(videoId, { status: 'failed' });
    io.emit('video-status', { videoId, status: 'failed', progress: 0 });
  }
};