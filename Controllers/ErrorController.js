const APPERROR = require('../Utilities/APPERROR');

const HandleDuplicateName = (error) => {
  const value = error.message.match(/(?:"[^"]*"|^[^"]*$)/)[0].replace(/"/g, '');
  const message = `invalid Name ${value} Already exists.`;
  return new APPERROR(message, 400);
};
const HandleJsonWebTokenError = () => {
  const message = `invalid Token please login again.`;
  return new APPERROR(message, 401);
};
const HandleTokenExpiredError = () => {
  const message = `Token Timed out please login again.`;
  return new APPERROR(message, 401);
};
const HandleCastErrorDB = (error) => {
  const message = `invalid ${error.path} : ${error.value}.`;
  return new APPERROR(message, 400);
};
const HandleValidationError = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);
  const ErrMessage = `invalid input Data.${errors.join(', ')} `;
  return new APPERROR(ErrMessage, 400);
};
const SendErrDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went Wrong',
      message: err.message,
    });
  }
};
const SendErrorProd = (error, req, res) => {
  // A
  if (req.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: 'Error',
        message: 'UH OH! SOMETHING WENT WRONG!',
      });
    }
  } else {
    // B
    if (error.isOperational) {
      res.status(error.statusCode).render('error', {
        title: 'Something went Wrong',
        message: error.message,
      });
    } else {
      res.status(error.statusCode).render('error', {
        title: 'Something went Wrong',
        message: 'please try again Later !!',
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  if (process.env.NODE_ENV === 'development') {
    SendErrDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = HandleCastErrorDB(err);
    if (err.name === 'ValidationError') err = HandleValidationError(err);
    if (err.name === 'JsonWebTokenError') err = HandleJsonWebTokenError(err);
    if (err.name === 'TokenExpiredError') err = HandleTokenExpiredError(err);
    if (err.code === 11000) err = HandleDuplicateName(err);
    SendErrorProd(err, req, res);
  }
};
