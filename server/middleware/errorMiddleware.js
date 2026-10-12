const mongoose = require('mongoose');

function notFound(req, res, next) {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'Internal server error';

  if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON request body';
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(error.errors)[0]?.message || 'Validation failed';
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid resource ID';
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists';
  } else if (statusCode >= 500) {
    message = 'Internal server error';
    console.error(error);
  }

  res.status(statusCode).json({ success: false, message });
}

module.exports = { notFound, errorHandler };
