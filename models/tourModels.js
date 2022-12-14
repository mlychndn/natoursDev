const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name 😁'],
    unique: true,
  },
  ratings: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: String,
    required: [true, 'A tour must have a price'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
