import React, { useRef, useEffect } from 'react';

const VideoPlayer = ({ videoId }) => {
  const videoRef = useRef(null);
  // Ensure this matches your Backend Port (5000)
  const streamUrl = `http://localhost:5000/api/videos/stream/${videoId}`;

  useEffect(() => {
    // Reload video when ID changes
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoId]);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
      <video 
        ref={videoRef}
        controls 
        autoPlay
        width="100%" 
        height="500px"
        className="w-full h-auto"
        onError={(e) => console.error("Video Error:", e)}
      >
        <source src={streamUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="p-2 bg-gray-900 text-white text-xs text-center">
        Stream URL: {streamUrl}
      </div>
    </div>
  );
};

export default VideoPlayer;