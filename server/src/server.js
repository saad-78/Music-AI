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

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,        // https://music-ai-dc7l.vercel.app
  'http://localhost:5173',
  'https://music-ai-dc7l.vercel.app'        // local dev
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Middleware
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
