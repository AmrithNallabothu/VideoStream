import { useState } from 'react';
import api from '../api/axios';

const UploadWidget = ({ onUploadStarted }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('video', file); // Must match backend: upload.single('video')
    formData.append('title', file.name);

    try {
      setUploading(true);
      // POST request to your backend
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFile(null);
      setUploading(false);
      onUploadStarted(); // Trigger refresh in parent component
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Check console.");
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
      <h2 className="text-xl font-semibold mb-4">Upload New Video</h2>
      <form onSubmit={handleUpload} className="flex gap-4 items-center flex-wrap">
        <input 
          type="file" 
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button 
          type="submit" 
          disabled={!file || uploading}
          className={`px-6 py-2 rounded-lg text-white font-bold ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default UploadWidget;