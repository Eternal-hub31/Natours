const Mongoose = require('mongoose');
const slugify = require('slugify');
// const Review = require('./ReviewsModel');

const toursSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'The tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'The max tour name is 40 char'],
      minlength: [10, 'The min tour name is 10 char'],
    },
    duration: {
      type: Number,
      required: [true, 'The tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'The tour must have a Group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'The tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either easy or medium or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating Must be above one (1.00)'],
      max: [5, 'Rating Must be below five (5.00)'],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'The tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message:
          'Discount Price can not be higher than price your input was ({VALUE})',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'The tour must have a summary'],
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    guides: [{ type: Mongoose.Schema.ObjectId, ref: 'User' }],
    startLocation: {
      // <Geo location/>
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: String,
      },
    ],
    imageCover: {
      type: String,
      required: [true, 'The tour must have a Cover Image'],
    },
    images: [String],
    CreatedAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Doc middleWare and it runs .save .create and NOT on .insertMany
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
// toursSchema.index({
//   price: 1,
// });
toursSchema.index({
  startLocation: '2dsphere',
});
toursSchema.index({
  price: 1,
  ratingsAverage: -1,
});
toursSchema.index({
  slug: 1,
});
//QueryMiddleWare
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = new Date();
  next();
});
toursSchema.post(/^find/, (_docs, next) => {
  next();
});
toursSchema.virtual('durationinWeeks').get(function () {
  return (this.duration / 7).toFixed(1);
});
toursSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
});

const Tour = Mongoose.model('Tour', toursSchema);
module.exports = Tour;
