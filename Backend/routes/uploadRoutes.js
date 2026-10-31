const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const crypto = require('crypto');

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');

    // Generate secure random filename
    const uuid = crypto.randomBytes(16).toString('hex');

    return {
      folder: 'house_rent_lk',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'avi', 'mkv']
        : ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${Date.now()}-${uuid}`,
    };
  },
});

// File filter to explicitly deny execution files before stream hits Cloudinary
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  },
  fileFilter
});

// Identity documents: stored as "authenticated" assets, so they are only reachable
// through signed URLs generated for admins (see verificationController).
const verificationUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: 'house_rent_lk_kyc',
      type: 'authenticated',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${Date.now()}-${crypto.randomBytes(16).toString('hex')}`,
    }),
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG or WEBP images are allowed'), ok);
  },
});

// Turn multer errors (size, count, type) into 400 responses
const handleUpload = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(err);
    }
    next();
  });
};

// @desc    Upload a single image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, handleUpload(upload.single('image')), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.send(req.file.path); // path is the Cloudinary secure_url by default in multer-storage-cloudinary
});

// @desc    Upload multiple images/videos
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, handleUpload(upload.array('images', 10)), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const paths = req.files.map((file) => file.path);
  res.send(paths);
});

// @desc    Upload identity documents (private)
// @route   POST /api/upload/verification-docs
// @access  Private
router.post('/verification-docs', protect, handleUpload(verificationUpload.array('images', 4)), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  // Return only the asset ids; the files are not publicly viewable
  res.json(req.files.map((file) => ({ publicId: file.filename })));
});

module.exports = router;
