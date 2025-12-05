const express = require('express');
const router = express.Router();
const { generatePlaylist, getPlaylistById } = require('../controllers/playlistController');

// POST /api/playlists/generate
router.post('/generate', generatePlaylist);

// GET /api/playlists/:id
router.get('/:id', getPlaylistById);

module.exports = router;
