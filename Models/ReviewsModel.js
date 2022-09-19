const Mongoose = require('mongoose');
const Tour = require('./TourModel');

const reviewSchema = new Mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Reviews can not be empty'],
    },
    rating: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: Mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'There must be a Tour referance'],
    },

    user: {
      type: Mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'There must be a User referance'],
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: '-guides name',
  // }).populate({
  //   path: 'user',
  //   select: 'name',
  // });
  this.populate({
    path: 'user',
  });
  next();
});
reviewSchema.statics.calAvergeRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
reviewSchema.post('save', function () {
  this.constructor.calAvergeRating(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.query = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.query.constructor.calAvergeRating(this.query.tour);
});
const Review = Mongoose.model('Review', reviewSchema);
module.exports = Review;
// POST /tour/23232323/reviews
