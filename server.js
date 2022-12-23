const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTIONS 💥 shutting down....');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection succesful ❤️');
  })
  .catch((err) => {
    console.log(`error is ${err.message}`);
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`server is running on ${port}....`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥');
  server.close(() => {
    process.exit(1);
  });
});
