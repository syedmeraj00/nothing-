// Logging middleware

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  // Capture response end
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusIcon = status >= 400 ? '❌' : '✅';
    console.log(`${statusIcon} [${status}] ${req.method} ${req.path} - ${duration}ms`);
    originalEnd.apply(res, args);
  };
  
  next();
};

const errorLogger = (err, req, res, next) => {
  console.error(`❌ ERROR: ${err.message}`);
  console.error(`   Stack: ${err.stack}`);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  requestLogger,
  errorLogger,
};
