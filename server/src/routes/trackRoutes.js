const express = require('express');
const router = express.Router();

const upload = require('../middleware/uploadAudio');
const { uploadTrack, listTracks } = require('../controllers/trackController');

// POST /api/tracks/upload
router.post('/upload', upload.single('audio'), uploadTrack);

// GET /api/tracks
router.get('/', listTracks);

module.exports = router;
