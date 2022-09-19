const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const CookieParser = require('cookie-parser');
const tourRouter = require('./Routes/TourRoutes');
const bookingRouter = require('./Routes/BookingRoutes');
const viewRouter = require('./Routes/ViewsRoutes');
const userRouter = require('./Routes/UserRoutes');
const reviewsRouter = require('./Routes/ReviewsRoutes');
const APPERROR = require('./Utilities/APPERROR');
const globleErrorHandler = require('./Controllers/ErrorController');

const app = express();
// other app.use() options ...

app.set('view engine', 'pug');
app.set('Views', path.join(__dirname, 'Views'));
app.use(express.static(path.join(__dirname, 'public')));
app.options('*', cors());

// Set security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network',
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(CookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'price',
      'difficulty',
    ],
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Hold your horses , you sent too many Requests wait an hour',
});
app.use('/api', limiter);
app.use('/api/v1/Reviews', reviewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/users', userRouter);
app.use('/', viewRouter);
app.all('*', (req, res, next) => {
  next(
    new APPERROR(`Can not Find the Route you requested ${req.originalUrl}`),
    404
  );
  req.on('abort', function (err) {
    if (err) console.error(err.message);

    // your code here
  });
});

app.use(globleErrorHandler);
module.exports = app;
