const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// router.param('id', tourController.idValiadtion);

router
  .route('/top-5-cheap-best-tour')
  .get(tourController.getCheapBestTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/busy-month').get(tourController.getBusiestMonth);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
