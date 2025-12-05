const path = require('path');
const { parseFile } = require('music-metadata');
const Track = require('../models/Track');

exports.uploadTrack = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const fullPath = file.path;

    let title = file.originalname.replace(path.extname(file.originalname), '');
    let artist = 'Unknown Artist';
    let duration = 0;

    try {
      const metadata = await parseFile(fullPath, { duration: true });
      if (metadata.common && metadata.common.title) {
        title = metadata.common.title;
      }
      if (metadata.common && metadata.common.artist) {
        artist = metadata.common.artist;
      }
      if (metadata.format && metadata.format.duration) {
        duration = Math.round(metadata.format.duration);
      }
    } catch (err) {
      console.warn('Metadata parse failed, using defaults:', err.message);
    }

    const fileUrl = `/audio/${file.filename}`;

    const track = await Track.create({
      title,
      artist,
      filename: file.filename,
      originalName: file.originalname,
      fileUrl,
      duration,
      fileSize: file.size,
      mimetype: file.mimetype
    });

    res.status(201).json({ track });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Failed to upload track' });
  }
};

exports.listTracks = async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    res.json({ tracks });
  } catch (err) {
    console.error('List tracks error:', err);
    res.status(500).json({ message: 'Failed to fetch tracks' });
  }
};
