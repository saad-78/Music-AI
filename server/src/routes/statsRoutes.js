const express = require('express');
const router = express.Router();
const { getTopTracks } = require('../controllers/statsController');

// GET /api/stats/top-tracks
router.get('/top-tracks', getTopTracks);

module.exports = router;
