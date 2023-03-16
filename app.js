require('dotenv').config();
const express = require('express');
const app = express();
const userRouter = require('./users/user.router');
const productRouter = require('./products/product.router');
const healthRouter = require('./healthz/health.router');
const fileUpload = require('express-fileupload')

app.use(fileUpload());
app.use(express.json());
app.use('/v1/user', userRouter);
app.use('/healthz', healthRouter);
app.use('/v1/product', productRouter);
  
module.exports = app