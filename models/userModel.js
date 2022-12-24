const mongoose = require('mongoose');
const validator = require('validator');

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
      'password lenght should be greater or equal than 8 characters',
    ],
    maxLength: [20, 'Password lenght should not be greater than 20 chars'],
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

const User = mongoose.model('User', userSchema);

module.exports = User;
