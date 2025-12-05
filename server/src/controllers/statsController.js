const Track = require('../models/Track');
const { getRedisClient } = require('../config/redis');

// GET /api/stats/top-tracks
exports.getTopTracks = async (req, res) => {
  try {
    const cacheKey = 'top_tracks_v1';
    const ttlSeconds = 60;

    const redisClient = await getRedisClient();

    if (redisClient) {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return res.json({
          fromCache: true,
          tracks: data
        });
      }
    }

    const topTracks = await Track.find({ usageCount: { $gt: 0 } })
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(10)
      .select('title artist fileUrl usageCount duration')
      .lean();

    if (redisClient) {
      await redisClient.setEx(cacheKey, ttlSeconds, JSON.stringify(topTracks));
    }

    res.json({
      fromCache: false,
      tracks: topTracks
    });
  } catch (err) {
    console.error('Top tracks error:', err);
    res.status(500).json({ message: 'Failed to fetch top tracks' });
  }
};
