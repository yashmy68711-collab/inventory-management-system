function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal server error';
  let details;

  if (err.name === 'CastError') { statusCode = 400; message = 'Invalid resource ID'; }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    details = Object.values(err.errors).map((item) => item.message);
    message = 'Validation failed';
  }
  if (err.code === 11000) {
    statusCode = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue || {}).join(', ')}`;
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

module.exports = { notFound, errorHandler };
