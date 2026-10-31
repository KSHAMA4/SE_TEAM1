// Global error handling middleware
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR ${statusCode}]:`, message);

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : 'Client Error',
    message,
    ...(err.alternatives ? { suggestedAlternatives: err.alternatives } : {})
  });
}

module.exports = errorHandler;
