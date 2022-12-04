const dotenv = require('dotenv');
const mongoose = require('mongoose');

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
app.listen(port, () => {
  console.log(`server is running on ${port}....`);
});
