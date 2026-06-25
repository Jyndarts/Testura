const { error } = require('../utils/apiResponse');

const errorHandler = (err, req, res, _next) => {
  console.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json(error(message));
};

module.exports = errorHandler;
