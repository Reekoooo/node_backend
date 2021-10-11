const AppError = require('../util/app_error');

const catchAsync = (fn,session) =>{

    return (req,res,next)=>{
        
        return fn(req,res,next)
        .catch(async err=>{
            if(session){
                await session.abortTransaction();
                session.endSession
                //console.log(session.transaction.state)
            }
            next(err);
        });
    }
}

    

module.exports = catchAsync;