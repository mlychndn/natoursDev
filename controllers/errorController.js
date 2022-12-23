const ApiError = require('../utils/apiError');

const castErrorHandle = (err) => {
  const message = ` Invalid ${err.path}: ${err.value}`;
  const statusCode = 400;
  return new ApiError(message, statusCode);
};

const duplicateKeyError = (err) => {
  console.log(err.keyValue.name);
  const message = `Duplicate field value: ${err.keyValue.name}`;
  const statusCode = 400;
  return new ApiError(message, statusCode);
};

const validationErrorHandle = (err) => {
  const errorString = Object.values(err.errors)
    .map((el) => el.properties.message)
    .join(', ');

  const message = `Valiadtion Error: ${errorString}`;
  const statusCode = 400;
  return new ApiError(message, statusCode);
};

const developmentError = (err, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'err';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const productionError = (err, res) => {
  console.log(err);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'err';

  if (err.name === 'CastError') err = castErrorHandle(err);
  if (err.code === 11000) err = duplicateKeyError(err);
  if (err.name === 'ValidationError') err = validationErrorHandle(err);

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = (err, req, res, next) => {
  console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'development') {
    developmentError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    productionError(err, res);
  }
};
