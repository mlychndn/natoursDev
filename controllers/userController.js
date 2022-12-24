const User = require('../models/userModel');
const catchAsync = require('./catcAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    status: 'success',
    result: user.length,
    data: {
      user,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(500).json({
    status: 'succcess',
    data: user,
  });
});

exports.getUser = (req, res, next) => {
  res.status(500).json({
    status: 'succcess',
    message: 'route under maintainance',
  });
};

exports.updateUser = (req, res, next) => {
  res.status(500).json({
    status: 'success',
    message: 'route under maintainance',
  });
};

exports.deleteUser = (req, res, next) => {
  res.status(500).json({
    status: 'succes',
    message: 'route under maintainance',
  });
};
