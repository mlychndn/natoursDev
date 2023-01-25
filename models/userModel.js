const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    minLength: [5, 'name should be greter or equal than 5 characters'],
    maxLength: [40, 'name length should be less than or equal to 40 chars'],
  },
  email: {
    type: String,
    required: [true, 'Please enter a valid email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email should be valid'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin', 'admin-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLenght: [
      8,
      'password length should be greater or equal than 8 characters',
    ],
    maxLength: [20, 'Password lenght should not be greater than 20 chars'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must enter a passwordConfirm'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Password and passwordConfirm should be same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //console.log(this);
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.post('save', (doc, next) => {
  console.log('password is hashed using bcrypt');
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});
// instance method on monggose schema
// this method will be available on every document used by this schema

/* userSchema.methods.printMyName = function () {
  console.log(`My name is ${this.name}`);
};
*/

userSchema.methods.passwordValidation = async function (
  userInputPass,
  userSavedPass
) {
  return await bcrypt.compare(userInputPass, userSavedPass);
};

userSchema.methods.tokenChangeCheck = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    // console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createResetToken = async function () {
  const resetToken = await crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = await crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Number(Date.now()) + Number(10 * 60 * 1000);
  return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
