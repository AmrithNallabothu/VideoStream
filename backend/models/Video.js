const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filename: { type: String, required: true, unique: true },
  path: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['uploading', 'processing', 'completed', 'failed'], default: 'uploading' },
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);