const express = require('express');
const { CreateCheckSession } = require('../Controllers/BookingController');
const { protectRoutes, restrictTo } = require('../Controllers/AuthController');

const Router = express.Router();
Router.get('/checkout-session/:tourID', protectRoutes, CreateCheckSession);
module.exports = Router;
