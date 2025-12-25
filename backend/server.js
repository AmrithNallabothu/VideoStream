const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to Database
connectDB();

// --- 1. FIXED CORS FOR VIDEO STREAMING ---
app.use(cors({
  origin: 'http://localhost:5173', // Allow your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'], // Allow Range requests
  exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'], // Expose headers for video player
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/video');

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Video Processing API is running!' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Test at: http://localhost:${PORT}`);
});