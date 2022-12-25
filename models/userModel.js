const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
});

userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.post('save', (doc, next) => {
  console.log('password is hashed using bcrypt');
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
const User = mongoose.model('User', userSchema);

module.exports = User;
