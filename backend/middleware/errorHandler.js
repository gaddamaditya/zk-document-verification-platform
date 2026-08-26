/**
 * Centralized error handling middleware.
 * Catches multer errors and unhandled exceptions,
 * returning structured JSON error responses.
 */

const multer = require('multer');

function errorHandler(err, req, res, next) {
  // Handle Multer-specific errors
  if (err instanceof multer.MulterError) {
    const multerErrors = {
      LIMIT_FILE_SIZE: {
        status: 413,
        message: 'File too large. Maximum allowed size is 10 MB.',
      },
      LIMIT_UNEXPECTED_FILE: {
        status: 400,
        message: 'Unexpected file field. Use "document" as the field name.',
      },
      LIMIT_FILE_COUNT: {
        status: 400,
        message: 'Too many files. Only one file is allowed per upload.',
      },
    };

    const mapped = multerErrors[err.code] || {
      status: 400,
      message: `Upload error: ${err.message}`,
    };

    return res.status(mapped.status).json({
      success: false,
      error: mapped.message,
    });
  }

  // Handle custom validation errors (e.g., invalid file type)
  if (err.message && err.message.startsWith('INVALID_FILE_TYPE')) {
    return res.status(415).json({
      success: false,
      error: 'Invalid file type. Allowed types: PDF, PNG, JPG, JPEG.',
    });
  }

  // Handle all other errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: 'Internal server error.',
  });
}

module.exports = errorHandler;
