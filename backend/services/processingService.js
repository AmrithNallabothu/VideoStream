const Video = require('../models/Video');

const processVideo = async (videoId, io) => {
  console.log(`🎬 Starting processing for video: ${videoId}`);
  
  let progress = 0;
  
  // Simulate processing loop (updates every 2 seconds)
  const interval = setInterval(async () => {
    progress += 20;
    console.log(`Processing ${videoId}: ${progress}%`);

    // 1. Emit Progress to Frontend (Real-time)
    io.emit('processing-update', { videoId, progress });

    if (progress >= 100) {
      clearInterval(interval);
      
      // 2. Randomly decide if safe or flagged (Simulation)
      const isSafe = Math.random() > 0.3; // 70% chance safe
      const status = isSafe ? 'safe' : 'flagged';

      console.log(`✅ Processing complete. Status: ${status}`);

      // 3. Update Database
      await Video.findByIdAndUpdate(videoId, {
        status: status,
        sensitivityScore: isSafe ? 0.1 : 0.9
      });
      
      // 4. Tell Frontend it's done
      io.emit('processing-complete', { videoId, status });
    }
  }, 2000);
};

module.exports = { processVideo };