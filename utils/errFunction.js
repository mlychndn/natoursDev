const ApiError = require('./apiError');

const errorFunction = (id) => {
  const err = new ApiError(`No tour associated with ${id}`, 404);
  return err;
};

module.exports = errorFunction;
