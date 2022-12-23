const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name 😁'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour length must be equal or less than 40 characters'],
      minLength: [
        10,
        'A tour length must be greter than or equal to 10 characters',
      ],
      // validate: [validator.isAlpha, 'A tour must have aplphabets'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour  must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium, difficult.',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Minimum rating should not be less than 1'],
      max: [5, 'Maximum rating should not be greter than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      min: [10, 'A tour price should be greter or equal than 10'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'A tour price must be greater than priceDiscount',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('duartionInWeek').get(function () {
  return Math.ceil(this.duration / 7);
});

// mongoose middleware
//1. document middleware

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre('save', function (next) {
  console.log('Date is processing....');
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log(`document is saved`);
  next();
});

//2. query middleware

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.startTime = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  const queryTime = Date.now() - this.startTime;
  console.log(`Time taken to fetch query is: ${queryTime} milliseconds`);
  next();
});

// aggregate middleware

tourSchema.pre('aggregate', function (next) {
  this._pipeline.unshift({ $match: { secretTour: { $ne: true } } });
  this.startTime = Date.now();
  next();
});

tourSchema.post('aggregate', function (doc, next) {
  console.log(
    `Time taken to fetch query: ${Date.now() - this.startTime} milliseconds`
  );
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
