const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

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

// set security http header middleware
app.use(helmet());

//const cors = require('cors');

// cors middleware
const corsOptions = {
  origin: 'http://localhost:59319',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
//middleware functions

// development middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// express rate limit middle ware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again in an hour',
});

app.use('/api', limiter);

// bodyparser middleware
// middleware for getting value of req.body
app.use(express.json({ limit: '10kb' }));
// middleware for rendering static pages

// Data sanitization against NOSql injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
app.use(express.static(`${__dirname}/public`));
//app.use(cors());

// app.use((req, res, next) => {
//   console.log('Hello from middleware!👋');
//   next();
// });

// log time check middleware
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});

// parameter pollution prevention middleware

app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'maxGroupSize',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'name',
    ],
  })
);

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
