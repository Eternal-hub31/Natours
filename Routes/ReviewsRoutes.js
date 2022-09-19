const express = require('express');
const {
  GetAllReviews,
  CreateReviews,
  DeleteReview,
  UpdateReview,
  setTourandUserIds,
  GetReview,
} = require('../Controllers/ReviewsController');
const { protectRoutes, restrictTo } = require('../Controllers/AuthController');

const Router = express.Router({
  mergeParams: true,
});
Router.use(protectRoutes);

Router.route('/')
  .get(GetAllReviews)
  .post(restrictTo('user'), setTourandUserIds, CreateReviews);
Router.route('/:id')
  .get(GetReview)
  .delete(restrictTo('user', 'admin'), DeleteReview)
  .patch(restrictTo('user', 'admin'), UpdateReview);
module.exports = Router;
