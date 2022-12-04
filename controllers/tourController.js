const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.idValiadtion = (req, res, next, value) => {
  if (value * 1 < 0 || value * 1 >= tours.length) {
    return res.status(401).json({
      status: 'fail',
      message: 'Tour Id Invalid 😊',
    });
  }
  next();
};

exports.tourValidation = (req, res, next) => {
  console.log(req.body);
  const { name, price } = req.body;
  if (!name || Number(price) < 1) {
    return res.status(400).json({
      status: 'fail',
      message: 'tour name and price should not be empty',
    });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestedTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = async (req, res) => {
  //const tour = tours.find((tour) => tour.id === Number(req.params.id));
  const tour = await tours.find();

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  const id = tours.length - 1 + 1;
  const newTour = { id, ...req.body };
  //const newTour = Object.assign({ id: id }, req.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) {
        console.log(err.message);
      }
    }
  );
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: 'updated tour',
    },
  });
};

exports.deleteTour = (req, res) => {
  const redefinedTour = tours.filter(
    (tour) => tour.id !== Number(req.params.id)
  );
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(redefinedTour),
    (err) => {
      if (err) {
        return res.status(400).json({
          status: 'err',
          message: err.message,
        });
      }
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};
