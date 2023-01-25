const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
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

exports.updateMe = catchAsync(async (req, res, next) => {
  // create an error, if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new ApiError('this route is not for updating password'));
  }

  const { _id: id } = req.freshUser;
  const user = await User.findById(id);
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  const doc = await User.findByIdAndUpdate({ _id: id }, user, { new: true });

  res.status(201).json({
    status: 'success',
    message: 'user details updated',
    details: doc,
  });
});

exports.deleteDetails = catchAsync(async (req, res, next) => {
  //console.log(req.freshUser);
  const user = await User.find(req.freshUser._id);
  user.isActive = false;

  const doc = await User.findByIdAndUpdate(
    { _id: req.freshUser._id },
    { isActive: false },
    {
      new: true,
    }
  );

  console.log(doc);

  res.status(204).json({
    status: 'success',
    message: 'user successfully deleted',
    details: doc,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.find({ _id: req.params.id });

  res.status(200).json({
    status: 'succcess',
    count: user.length,
    results: {
      user,
    },
  });
});

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
