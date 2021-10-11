class AppError extends Error {

    constructor(message , statusCode){

    super(message);
    Object.defineProperty(this, 'message', {enumerable: true})
    Object.defineProperty(this, 'name', {enumerable: true})

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
    }
}


module.exports = AppError