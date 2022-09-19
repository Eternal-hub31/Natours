const dotenv = require('dotenv');
const Mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  // eslint-disable-next-line no-console
  console.log(`Server Will be shutdown due to ${err.name}`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
Mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
}).then(() => {
  // eslint-disable-next-line no-console
  console.log(`DB Connected`);
});
const app = require('./app');

const port = process.env.PORT || 3000;
const Server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`app Running on port ${port}`);
});
//Test Debugger
process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);
  Server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Error Sever is Killed in few seconds');
    process.exit(1);
  });
});
