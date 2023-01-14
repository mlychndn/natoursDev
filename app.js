const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const ApiError = require('./utils/apiError');
// const set = require('lodash.set');

// const object = { a: [{ b: { c: 3 } }] };
// //console.log(object.a[0].b.c);
// set(object, 'a[0]', { malay: 2340490 });
// console.log(object.a[0]);

const errController = require('./controllers/errorController');

const app = express();

//middleware functions

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// middleware for getting value of req.body
app.use(express.json());
// middleware for rendering static pages
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log('Hello from middleware!👋');
//   next();
// });

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});

// routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// to hanle all routes which are not defined
app.all('*', (req, res, next) => {
  const message = `${req.originalUrl} is not defined  ⛔⛔`;
  const statusCode = 404;
  const err = new ApiError(message, statusCode);
  next(err);
});

// global error middleware

app.use(errController);
module.exports = app;
