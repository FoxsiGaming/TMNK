const multer = require('multer');
const path = require('path');

function createUploader(subfolder) {
  const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads', subfolder),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, unique + ext);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
      const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
      if (allowed.test(path.extname(file.originalname))) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });
}

module.exports = { createUploader };
