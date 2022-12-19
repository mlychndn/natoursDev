const Tour = require('../models/tourModels');

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
    // { duration: { gte: '3' }, difficulty: 'easy' }
    // { duration: { $gte: '3' }, difficulty: 'easy' }

    // 1a. simple filter
    const excludedString = ['page', 'limit', 'sort', 'fields', 'order'];
    const modifiedQuery = { ...req.query };

    excludedString.forEach((str) => delete modifiedQuery[str]);

    // 1b. advance filter
    let queryStr = JSON.stringify(modifiedQuery);
    queryStr = JSON.parse(
      queryStr
        .replace('lt', '$lt')
        .replace('lte', '$lte')
        .replace('gt', '$gt')
        .replace('gte', '$gte')
    );

    // queryStr = JSON.parse(
    //   queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    // );

    let query = Tour.find(queryStr);

    //2. sorting
    const { sort, fields } = req.query;

    if (sort) {
      const sortQuery = sort.split(',').join(' ');
      query = query.sort(sortQuery);
    } else {
      query = query.sort('createdAt');
    }

    if (fields) {
      console.log(fields);
      const fieldQuery = fields.split(',').join(' ');
      query = query.select(fieldQuery);
    } else {
      query = query.select('-__v');
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 3;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    const tours = await query;

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
