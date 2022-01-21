const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const VALID_TYPE_FILES = ['image/png', 'image/jpg', 'image/jpeg'];

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
  destination: (res, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
});

const fileFilter = (req, file, cb) => {
  if (VALID_TYPE_FILES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type');
    cb(error);
  }
};
const upload = multer({
  storage,
  fileFilter,
});

const uploadToCloudinary = async (req, res, next) => {
  console.log('middleware', req.file);
  if (!req.file) {
    console.log('no hay req.file');
    return next();
  }
  try {
    const filePath = req.file.path;
    console.log('hay req.file', req.file.path);
    const image = await cloudinary.uploader.upload(filePath, { folder: 'social-media-app' });
    console.log('image', image);
    await fs.unlinkSync(filePath);
    req.file_url = image.secure_url;
    console.log('req.file_url', req.file_url);
    return next();
  } catch (error) {
    console.log('error middleware');
    return next(error);
  }
};

module.exports = { upload, uploadToCloudinary };
