const Tour = require('../models/tourModels');
const APIFeatures = require('../utils/apiFeatures');

// exports.idValiadtion = (req, res, next, value) => {
//   if (value * 1 < 0 || value * 1 >= tours.length) {
//     return res.status(401).json({
//       status: 'fail',
//       message: 'Tour Id Invalid 😊',
//     });
//   }
//   next();
// };

// exports.tourValidation = (req, res, next) => {
//   const { name, price } = req.body;
//   if (!name || Number(price) < 1) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'tour name and price should not be empty',
//     });
//   }
//   next();
// };

exports.getCheapBestTour = (req, res, next) => {
  req.query.sort = 'price,-ratingsAverage';
  req.query.limit = 5;

  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    //const tour = await Tour.findById(req.params.id);
    const tour = await Tour.findOne({ _id: req.params.id });

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: error,
      message: error.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
  // 1st method:
  // const newTour = new Tour(req.body);
  // await newTour.save();

  // 2nd method:
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  const tour = await Tour.findByIdAndDelete(req.params.id, req.body);
  res.status(204).json({
    status: 'success',
    data: tour,
  });
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.getBusiestMonth = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
