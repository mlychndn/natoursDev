const User = require('../models/userModel');
const catchAsync = require('./catcAsync');

exports.signUp = catchAsync(async (req, res, next) => {
  const user = new User(req.body);
  await User.save(user);

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});
