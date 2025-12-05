const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, default: 'Unknown Artist' },
    filename: { type: String, required: true }, // stored file name on disk
    originalName: { type: String, required: true }, // original uploaded name
    fileUrl: { type: String, required: true }, // /audio/...
    duration: { type: Number, default: 0 }, // in seconds
    fileSize: { type: Number, required: true },
    mimetype: { type: String, required: true },
    usageCount: { type: Number, default: 0, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Track', trackSchema);
