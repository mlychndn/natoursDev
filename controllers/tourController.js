const Tour = require('../models/tourModels');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./errorController');

exports.getCheapBestTour = (req, res, next) => {
  req.query.sort = 'price,-ratingsAverage';
  req.query.limit = 5;

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .selection()
    .paginate();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestedTime,
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //const tour = await Tour.findById(req.params.id);
  const tour = await Tour.findOne({ _id: req.params.id });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id, req.body);
  res.status(204).json({
    status: 'success',
    data: tour,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: 'ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgRating: 1 },
    },
    // {
    //   $match: { _id: { $eq: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'sucess',
    data: stats,
  });
});

exports.getBusiestMonth = catchAsync(async (req, res, next) => {
  const { year } = req.query;
  console.log(year);
  const busiestMonth = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $sort: { numTours: -1 },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $limit: 12 },
  ]);
  res.status(200).json({
    status: 'sucess',
    result: busiestMonth.length,
    data: busiestMonth,
  });
});
