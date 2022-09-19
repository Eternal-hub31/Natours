const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const Email = require('../Utilities/EMAIL');
const UserModel = require('../Models/UserModel');
const CatchAsync = require('../Utilities/CATCHASYNC');
const AppError = require('../Utilities/APPERROR');

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ["admin" , "lead-guide"]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403)
      );
    }
    next();
  };
const SignToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_IN,
  });
function daysToMilliseconds(days) {
  // 👇️        hour  min  sec  ms
  return days * 24 * 60 * 60 * 1000;
}
const cookieops = {
  expires: new Date(
    Date.now() + daysToMilliseconds(process.env.JWT_COOKIE_EXP)
  ),
  httpOnly: true,
};
const CreateAndSendToken = (user, statusCode, res) => {
  user.password = undefined;
  const token = SignToken(user._id);
  if (process.env.NODE_ENV === 'production') cookieops.secure = true;
  res.cookie('JWT', token, cookieops);
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};
exports.checkLogin = async (req, res, next) => {
  try {
    if (req.cookies.JWT) {
      const decoded = await promisify(jwt.verify)(
        req.cookies.JWT,
        process.env.JWT_SECRET
      );

      //step 2 Check User if still exists
      const freshUser = await UserModel.findById(decoded.id);
      if (!freshUser) return next();
      //step 3 Check User if Changed password after token was issused
      if (freshUser.CheckChangedPassword(decoded.iat)) {
        return next();
      }
      // step 4 GRANTED ACCESS TO THE NEXT MIDDLEWARE (ROUTER)
      res.locals.user = freshUser;
      return next();
    }
  } catch (error) {
    return next();
  }
  next();
};
exports.logout = (req, res, next) => {
  res.cookie('JWT', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
  next();
};
exports.protectRoutes = CatchAsync(async (req, res, next) => {
  //step 1 get Token & check it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.JWT) {
    token = req.cookies.JWT;
  }
  if (!token) {
    return next(
      new AppError('you are not logged in please login to view the tours', 401)
    );
  }

  //step 2 Verication Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //step 3 Check User if still exists
  const freshUser = await UserModel.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('the user belonging to this token no longer exist', 401)
    );
  }
  //step 4 Check User if Changed password after token was issused
  if (freshUser.CheckChangedPassword(decoded.iat)) {
    return next(
      new AppError('User recently Changed the password please Login again', 401)
    );
  }
  // step 5 GRANTED ACCESS TO THE NEXT MIDDLEWARE (ROUTER)
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.signUp = CatchAsync(async (req, res, next) => {
  const user = await UserModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}:://${req.get('host')}/me`;
  console.log(req.protocol, url);
  await new Email(user, url).sendWelcome();
  CreateAndSendToken(user, 201, res);
});
exports.login = CatchAsync(async (req, res, next) => {
  const { email } = req.body;
  const { password } = req.body;
  //Step 1 check email & password if exists
  if (!email || !password) {
    return next(new AppError('please provide correct email and password', 400));
  }
  //Step 2 check if user exist and password is correct
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('wrong credentials', 401));
  }
  //Step 3 send token to client
  CreateAndSendToken(user, 200, res);
});
exports.forgetPassword = CatchAsync(async (req, res, next) => {
  // Steps
  //1) get User based on posted email
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('this email does not belong to any user', 404));
    //generateRandomToken
  }
  //2) Generate random reset token
  const resetToken = user.generateRandomToken();
  await user.save({ validateBeforeSave: false });
  //3) send it back as an email
  try {
    const ResetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;
    await new Email(user, ResetUrl).sendEmailPassword();
    res.status(200).json({
      status: 'success',
      message: 'token sent it email',
      ResetUrl,
      resetToken,
    });
  } catch (error) {
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    return next(
      new AppError(
        'there was an error sending the email , please try again',
        500
      )
    );
  }
});
exports.resetPassword = CatchAsync(async (req, res, next) => {
  // get User based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await UserModel.findOne({
    PasswordResetToken: hashedToken,
    //find if token hasn't expired
    PasswordResetExpires: { $gt: Date.now() },
  }).select('+password');
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 404));
  }
  // Reset password
  const checkUpdatepassowrd = await user.correctPassword(
    req.body.password,
    user.password
  );
  if (checkUpdatepassowrd) {
    return next(
      new AppError(
        'your new password cannot be the same as your old password',
        403
      )
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.PasswordResetToken = undefined;
  user.PasswordResetExpires = undefined;
  await user.save();
  CreateAndSendToken(user, 200, res);
});
exports.updatePassword = CatchAsync(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).select('+password');
  // check if posted current password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  const checkUpdatepassowrd = await user.correctPassword(
    req.body.password,
    user.password
  );
  if (checkUpdatepassowrd) {
    return next(
      new AppError(
        'your Updated password cannot be the same as your old password',
        403
      )
    );
  }
  // if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // log user in , send JWT
  CreateAndSendToken(user, 200, res);
});
