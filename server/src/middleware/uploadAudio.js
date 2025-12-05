const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const audioDir = path.join(__dirname, '..', '..', 'public', 'audio');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, audioDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${uuidv4()}-${base}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only MP3/WAV audio files are allowed'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = upload;
