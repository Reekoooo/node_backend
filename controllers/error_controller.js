const AppError = require('../util/app_error');

exports.pageNotFound = (req, res, next) => {
    const err = new AppError(`Can't find ${req.originalUrl} on this server!`,404)
    next(err)
  }

const sendErrorProd = (err,res)=>{

    if(err.isOperational ){
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message,
            error :err
        });
    }else{
        console.error('ERROR 💥: ', err);
        res.status(500).json({
            status: 'error',
            message : 'something went wrong !'
        });
    }
}
const sendErrorDev = (err,res)=>{
    res.status(err.statusCode).json({
        status : err.status,
        error :err ,
        message : err.message,
        stack: err.stack
    });
}
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
  };
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  };
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);  
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

exports.globalErrorHandler = (err,req,res,next)=>{
    console.log(err);
    err.statusCode =  err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,res)
    }else if(process.env.NODE_ENV === 'production'){
        let error = { ...err };
        if (err.name === 'CastError') error = handleCastErrorDB(err);
        if (err.code === 11000) error = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

        sendErrorProd (error,res);
    }
}