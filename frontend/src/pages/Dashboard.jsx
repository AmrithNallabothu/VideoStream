import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- 1. Import useNavigate
import io from 'socket.io-client';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import UploadWidget from '../components/UploadWidget';
import VideoPlayer from '../components/VideoPlayer';

// Connect to Backend Socket
const socket = io('http://localhost:5000');

const Dashboard = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate(); // <--- 2. Initialize Hook
  const [videos, setVideos] = useState([]); 
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos();

    socket.on('processing-update', ({ videoId, progress }) => {
      setVideos((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map(v => 
          v._id === videoId ? { ...v, status: 'processing', progress } : v
        );
      });
    });

    socket.on('processing-complete', ({ videoId, status }) => {
      setVideos((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map(v => 
          v._id === videoId ? { ...v, status, progress: 100 } : v
        );
      });
    });

    return () => {
      socket.off('processing-update');
      socket.off('processing-complete');
    };
  }, []);

  const fetchVideos = async () => {
    try {
      const { data } = await api.get('/videos');
      
      if (Array.isArray(data)) {
        setVideos(data);
      } else if (data && data.videos && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error("Failed to load videos", err);
      setVideos([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <nav className="flex justify-between mb-8 bg-white p-4 shadow rounded">
        <h1 className="text-2xl font-bold text-blue-600">VideoStream Pro</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.username || 'User'}</span>
          
          {/* 👇 3. UPDATED LOGOUT BUTTON 👇 */}
          <button 
            onClick={() => {
              logout();
              navigate('/login'); // Forces immediate redirect
            }} 
            className="text-red-500 font-bold hover:text-red-700"
          >
            Logout
          </button>

        </div>
      </nav>

      <UploadWidget onUploadStarted={fetchVideos} />

      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-3/4 max-w-4xl relative">
            <button 
              onClick={() => setSelectedVideo(null)} 
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              ✕
            </button>
            <VideoPlayer videoId={selectedVideo} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {Array.isArray(videos) && videos.length > 0 ? (
          videos.map((video) => (
            <div key={video._id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
              <h3 className="font-bold text-lg mb-2">{video.title || video.originalName}</h3>
              
              <div className="text-sm text-gray-500 mb-2">
                Status: <span className="font-semibold">{video.status}</span>
              </div>

              {video.status === 'processing' && (
                <div className="w-full bg-gray-200 h-2 rounded mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded transition-all duration-300" 
                    style={{ width: `${video.progress || 0}%` }}
                  ></div>
                </div>
              )}

              {(video.status === 'safe' || video.status === 'completed') && (
                <button 
                  onClick={() => setSelectedVideo(video._id)} 
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  ▶ Watch Video
                </button>
              )}

              {video.status === 'flagged' && (
                <div className="mt-4 w-full bg-red-100 text-red-600 py-2 rounded text-center border border-red-200">
                  ⚠️ Content Flagged
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 mt-10">
            <p className="text-xl">No videos found.</p>
            <p className="text-sm">Upload a video to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;