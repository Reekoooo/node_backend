const express = require('express');
const app = express();
const globalErrorHandler = require('./controllers/error_controller');
const Building = require('./models/building_model');
const userRouter = require('./routes/user_route');
const buildingRouter = require('./routes/building_route');
const flatRouter = require('./routes/flat_route');
const FlatRequest = require('./routes/flat_request_route');

app.use(express.static('uploads'))

app.use(express.json());

app.use('/users', userRouter);

app.use('/buildings',buildingRouter);

app.use('/flat',flatRouter);

app.use('/flat-request',FlatRequest)

app.all('*', globalErrorHandler.pageNotFound);

app.use(globalErrorHandler.globalErrorHandler);

module.exports = app