const { promisify } = require('util');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const catchAsync = require('./catcAsync');
const sendEmail = require('../utils/email');

const getToken = async (user, res, from) => {
  const token = await jwt.sign({ id: user._id }, process.env.JSON_SECRET_KEY, {
    expiresIn: process.env.EXPIRESIN,
  });

  const data = {};
  let message;

  from === 'signUp' ? (data[user] = user) : (data[user] = undefined);

  if (from === 'logIn') {
    message = 'successfully logged in';
  } else if (from === 'resetPassword') {
    message = 'password reset done';
  } else if (from === 'updatePassword') {
    message = 'password updated!';
  }

  user.password = undefined;

  console.log(process.env.NODE_ENV);

  const requestOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  process.env.NODE_ENV === 'production' ? (requestOptions.secure = true) : '';
  res.cookie('token', token, requestOptions);

  res.status(201).json({
    status: 'success',
    token,
    data,
    message,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt, role } =
    req.body;
  const user = new User({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
    role,
  });
  const newUser = await user.save();
  // newUser.printMyName();

  // console.log(process.env.EXPIRESIN, process.env.JSON_SECRET_KEY);

  await getToken(newUser, res, 'signUp');
  // const token = await jwt.sign(
  //   { id: newUser._id },
  //   process.env.JSON_SECRET_KEY,
  //   {
  //     expiresIn: process.env.EXPIRESIN,
  //   }
  // );

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
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

  await getToken(userRecord, res);
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

  const freshUser = { ...userCheck._doc };

  userCheck.tokenChangeCheck(iat);

  // console.log(iat, userCheck.createdAt.getTime());
  if (userCheck.tokenChangeCheck(iat)) {
    return next(new ApiError('Token change, use new token'));
  }

  req.freshUser = freshUser;
  next();
});

exports.uesrRight =
  (...data) =>
  (req, res, next) => {
    const { role } = req.freshUser;

    if (data.includes(role)) {
      next();
    } else {
      console.log("You don't have permission to delete data");
      next(new ApiError("You don't have permission to delete data", 403));
    }
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log('email', email);

  if (!email) {
    return next(new ApiError('Please provide your email address', 400));
  }

  const userSearch = await User.findOne({ email });

  if (!userSearch) {
    return next(new ApiError('Email address provided by you is not available'));
  }

  const resetToken = await userSearch.createResetToken();

  await userSearch.save({ validateBeforeSave: false });

  try {
    const endPoint = req.originalUrl;

    const newEndPoint = `${endPoint
      .split('/')
      .slice(0, -1)
      .join('/')}/resetPassword/${resetToken}`;
    const emailOptions = {};
    const url = `${req.protocol}://${req.get('host')}${newEndPoint}`;

    Object.assign(emailOptions, {
      from: 'Malay Chandan <mlychndn@gmail.com>',
      to: userSearch.email,
      subject: `Reset your password (expires in 10 min)`,
      text: `Forgot your password, Go to password resetlink: ${url}`,
    });

    await sendEmail(emailOptions);

    res.status(200).json({
      status: 'success',
      message: 'Yay! Password reset token sent 😊',
    });
  } catch (error) {
    userSearch.PasswordResetExpires = undefined;
    userSearch.passwordResetToken = undefined;

    await userSearch.save({ validateBeforeSave: false });

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }

  // next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Find the user using token
  const hashedToken = await crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log('hashed', hashedToken);
  // 2) If token has not expired, and there is user, set the new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError('Token is invalid or has expired', 400));
  }

  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  await getToken(user, res, 'resetPassword');
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection

  const { email } = req.freshUser;
  const { currentPassword, password, passwordConfirm } = req.body;
  const user = await User.findOne({ email: email }).select('+password');

  //2) check if posted current possword is correct

  const result = await user.passwordValidation(currentPassword, user.password);

  if (!result) {
    return next(new ApiError('current password entered by you is incorrect'));
  }
  // 3) update the password
  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();
  // 4) log user in, send jwt
  await getToken(user, res, 'updatePassword');

  // const token = await jwt.sign({ id: user._id }, process.env.JSON_SECRET_KEY, {
  //   expiresIn: process.env.EXPIRESIN,
  // });

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});
