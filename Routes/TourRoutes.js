const express = require('express');
const ReviewRouter = require('./ReviewsRoutes');
const {
  GetAllTours,
  CreateTour,
  DeleteTour,
  GetTour,
  UpdateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  UploadTourImages,
  ResizeTourImages,
} = require('../Controllers/TourController');
const { protectRoutes, restrictTo } = require('../Controllers/AuthController');

const Router = express.Router();
Router.use('/:tourId/reviews', ReviewRouter);
Router.route('/Monthly-Plan/:year').get(
  protectRoutes,
  restrictTo('admin', 'lead-guide', 'guide'),
  getMonthlyPlan
);
Router.route('/distances/:latlng/unit/:unit').get(getDistances);
Router.route('/Tours-within/:distance/center/:latlng/unit/:unit').get(
  getToursWithin
);
Router.route('/Top-five-cheap').get(aliasTopTours, GetAllTours);
Router.route('/Tour-stats').get(getTourStats);
Router.route('/')
  .get(GetAllTours)
  .post(protectRoutes, restrictTo('admin', 'lead-guide'), CreateTour);
Router.route('/:id')
  .get(GetTour)
  .delete(protectRoutes, restrictTo('admin', 'lead-guide'), DeleteTour)
  .patch(
    protectRoutes,
    restrictTo('admin', 'lead-guide'),
    UploadTourImages,
    ResizeTourImages,
    UpdateTour
  );

module.exports = Router;
