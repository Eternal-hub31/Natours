// const CatchAsync = require('../Utilities/CATCHASYNC');
const reviewModel = require('../Models/ReviewsModel');
const factory = require('./HandlerFactory');

exports.setTourandUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.GetAllReviews = factory.getAll(reviewModel);
exports.GetReview = factory.getOne(reviewModel);
exports.CreateReviews = factory.createOne(reviewModel);
exports.DeleteReview = factory.deleteOne(reviewModel);
exports.UpdateReview = factory.updateOne(reviewModel);
