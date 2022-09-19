const Stripe = require('stripe')(process.env.STRIPE_SECERT_KEY);
const Tour = require('../Models/TourModel');
const CatchAsync = require('../Utilities/CATCHASYNC');
const factory = require('./HandlerFactory');
const APPERROR = require('../Utilities/APPERROR');
exports.CreateCheckSession = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourID);
  const session = await Stripe.checkout.sessions.create({
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: `${req.user.email}`,
    client_reference_id: req.params.id,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: 500,
          product_data: {
            name: `${tour.name} Tour`,
            description: `${tour.summary}`,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});
