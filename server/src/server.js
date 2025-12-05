const path = require('path');
const express = require('express');
const cors = require('cors');
const trackRoutes = require('./routes/trackRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const statsRoutes = require('./routes/statsRoutes');

require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use('/api/tracks', trackRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/stats', statsRoutes);


// Static files for audio
app.use('/audio', express.static(path.join(__dirname, '..', 'public', 'audio')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mood DJ backend is alive' });
});

// TODO: later add routes: tracks, playlists, stats

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
