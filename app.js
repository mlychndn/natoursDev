const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//middleware functions

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// middleware for getting value of req.body
app.use(express.json());
// middleware for rendering static pages
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from middleware!👋');
  next();
});

app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});

// routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
