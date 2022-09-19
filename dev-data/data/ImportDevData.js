const fs = require('fs');
const dotenv = require('dotenv');
const Mongoose = require('mongoose');
const Tour = require('../../Models/TourModel');
const Review = require('../../Models/ReviewsModel');
const User = require('../../Models/UserModel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
Mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => {
  // eslint-disable-next-line no-console
  console.log('DB Connected');
});
// <!---READJSONFILE--!>
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
// <!---IMPORTFUNCTOURS--!>
const ImportData = async (req, res) => {
  await Tour.create(tours);
  await User.create(users, {});
  await Review.create(reviews);
  process.exit();
};

// <!---DeleteFUNC--!>
const DeletedData = async (req, res) => {
  await Tour.deleteMany();
  await User.deleteMany();
  await Review.deleteMany();
  process.exit();
};

if (process.argv[2] === '--import') {
  ImportData();
}
if (process.argv[2] === '--delete') {
  DeletedData();
}
