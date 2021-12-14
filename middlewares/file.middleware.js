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
  if (!req.files) {
    return next();
  }
  const avatarFile = req.files?.['avatar']?.[0];
  const coverFile = req.files?.['coverPic']?.[0];
  let paths = [];
  avatarFile ? (paths = [...paths, avatarFile.path]) : null;
  coverFile ? (paths = [...paths, coverFile.path]) : null;

  try {
    let images = [];

    for await (let path of paths) {
      console.log('inner path', path);

      if (avatarFile && path === avatarFile.path) {
        const image = await cloudinary.uploader.upload(path, { folder: 'social-media-app' });
        images = [...images, { avatar: image.secure_url }];
      }

      if (coverFile && path === coverFile.path) {
        const image = await cloudinary.uploader.upload(path, { folder: 'social-media-app' });
        images = [...images, { coverPic: image.secure_url }];
      }
    }
    req.files = images;
    paths.map((path) => fs.unlinkSync(path));
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { upload, uploadToCloudinary };
