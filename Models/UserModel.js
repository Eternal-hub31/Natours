const Mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const validator = require('validator');

const usersSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide your name'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'please provide a email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a Valid Email address'],
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },

  password: {
    type: String,
    required: [true, 'please Enter your password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password before continuing'],
    // create && save
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'password and confirm password do not match',
    },
  },
  passwordChangedAt: Date,
  PasswordResetToken: String,
  PasswordResetExpires: Date,

  photo: {
    type: String,
    default: 'default.jpg',
  },
});

usersSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Hashing the password with cost 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
usersSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

usersSchema.methods.generateRandomToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.PasswordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
usersSchema.methods.CheckChangedPassword = function (JWTTIMESSTAMP) {
  if (this.passwordChangedAt) {
    const changedTimesstamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTIMESSTAMP < changedTimesstamp; // 200 < 100
  }
  return false;
};
const User = Mongoose.model('User', usersSchema);
module.exports = User;
