const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const catchAsync = require('./catcAsync');

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt } =
    req.body;
  const user = new User({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
  });
  const newUser = await user.save();
  // newUser.printMyName();

  // console.log(process.env.EXPIRESIN, process.env.JSON_SECRET_KEY);

  const token = await jwt.sign(
    { id: newUser._id },
    process.env.JSON_SECRET_KEY,
    {
      expiresIn: process.env.EXPIRESIN,
    }
  );

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1. To check if email and password is input
  if (!email || !password) {
    return next(
      new ApiError(`email or password field should not be empty`, 401)
    );
  }

  //2. email and password is entered then find the records from db
  const userRecord = await User.findOne({ email }).select('+password');

  if (
    !userRecord ||
    !(await userRecord.passwordValidation(password, userRecord.password))
  ) {
    return next(new ApiError('Incorrect email or password', 401));
  }

  const token = await jwt.sign(
    { id: userRecord._id },
    process.env.JSON_SECRET_KEY,
    {
      expiresIn: process.env.EXPIRESIN,
    }
  );
  res.status(200).json({
    status: 'succes',
    message: 'user logged in',
    token,
  });
});

exports.userValidation = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return next(new ApiError('token is invalid', 401));
  }

  const token = authorization.split(' ')[1];

  const { id, iat } = await promisify(jwt.verify)(
    token,
    process.env.JSON_SECRET_KEY
  );

  const userCheck = await User.findById({ _id: id });

  if (!userCheck) {
    return next(new ApiError('User is not available'));
  }

  userCheck.tokenChangeCheck(iat);

  // console.log(iat, userCheck.createdAt.getTime());
  if (userCheck.tokenChangeCheck(iat)) {
    return next(new ApiError('Token change, use new token'));
  }
  next();
});
