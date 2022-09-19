const express = require('express');
const Router = express.Router();
const {
  GetAllUsers,
  CreateUser,
  GetUser,
  DeleteUser,
  UpdateUser,
  UpdateMe,
  deleteMe,
  getMe,
  UploadUserImage,
  ResizeUserImage,
} = require('../Controllers/UserController');
const {
  signUp,
  login,
  logout,
  forgetPassword,
  resetPassword,
  updatePassword,
  protectRoutes,
  restrictTo,
} = require('../Controllers/AuthController');
//No auth

Router.post('/signup', signUp);
Router.post('/login', login);
Router.get('/logout', logout);
Router.post('/forget-password', forgetPassword);
Router.patch('/reset-password/:token', resetPassword);
//protect all Routes after this middleware
Router.use(protectRoutes);
Router.get('/me', getMe, GetUser);
Router.delete('/delete-me', deleteMe);
Router.patch('/update-me', UploadUserImage, ResizeUserImage, UpdateMe);
Router.patch('/update-password', updatePassword);
// restricted to admin
Router.use(restrictTo('admin'));
Router.route('/').get(GetAllUsers).post(CreateUser);
Router.route('/:id').get(GetUser).delete(DeleteUser).patch(UpdateUser);

module.exports = Router;
