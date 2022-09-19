const ToursModel = require('../Models/TourModel');
const APPERROR = require('../Utilities/APPERROR');
const UserModel = require('../Models/UserModel');
const CatchAsync = require('../Utilities/CATCHASYNC');

exports.GetOverview = CatchAsync(async (req, res) => {
  //1) get all tour data from collection
  const tours = await ToursModel.find();
  //2)build the templete
  //3)render the templete from step 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});
exports.GetTourView = CatchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const tour = await ToursModel.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return next(new APPERROR('No tour with that name was found', 404));
  }
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: tour.name,
      tour,
    });
});
exports.GetBaseView = (req, res) => {
  res.status(200).render('base', {
    title: 'The Forest Hiker',
    user: 'Jonas Schmedtmann',
  });
};
exports.LoginController = (req, res) => {
  res.status(200).render('login', {
    title: 'Log in to your account',
  });
};
exports.signupController = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up for Natours',
  });
};
exports.ViewAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'your account',
  });
};
exports.UpdateUserData = CatchAsync(async (req, res, next) => {
  const body = req.body;
  const id = req.user.id;
  console.log('updating', body, id);
  const updatedUser = await UserModel.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },

    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'your account',
    user: updatedUser,
  });
});
