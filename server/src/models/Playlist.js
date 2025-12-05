const mongoose = require('mongoose');

const playlistTrackSchema = new mongoose.Schema(
  {
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
    order: { type: Number, required: true },
    weight: { type: Number, default: 1 }
  },
  { _id: false }
);

const playlistSchema = new mongoose.Schema(
  {
    mood: { type: String, required: true },
    tracks: [playlistTrackSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Playlist', playlistSchema);
