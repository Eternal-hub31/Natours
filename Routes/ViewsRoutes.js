const express = require('express');
const {
  GetOverview,
  GetTourView,
  LoginController,
  signupController,
  ViewAccount,
  UpdateUserData,
} = require('../Controllers/ViewsController');
const { checkLogin, protectRoutes } = require('../Controllers/AuthController');

const Router = express.Router();
Router.get('/', checkLogin, GetOverview);
Router.get('/login', checkLogin, LoginController);
Router.get('/signup', checkLogin, signupController);
Router.get('/tours/:slug', checkLogin, GetTourView);
Router.get('/me', protectRoutes, ViewAccount);
Router.post('/submit-user-data', protectRoutes, UpdateUserData);
module.exports = Router;
