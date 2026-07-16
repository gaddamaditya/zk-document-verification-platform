/**
 * File upload route.
 * POST /api/upload — accepts a single file (field: "document"),
 * stores it in uploads/, and returns file metadata.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
];

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueId}-${sanitizedName}`);
  },
});

// File filter — reject unsupported types
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'), false);
  }
};

// Multer instance: single file, 10 MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

router.post('/', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file provided. Send a file with field name "document".',
    });
  }

  const { file } = req;

  res.status(201).json({
    success: true,
    file: {
      id: file.filename.split('-')[0], // the uuid prefix
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storedAs: file.filename,
      uploadedAt: new Date().toISOString(),
    },
  });
});

module.exports = router;
