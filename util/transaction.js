const mongoose = require('mongoose');

const transaction = fn=>{
    
   return async (req,res,next)=>{
        const session = await mongoose.startSession();
        session.startTransaction();

        fn(req,res,next,session)
        .then(async result=>{
            await session.commitTransaction();
            session.endSession();

        })
        
        .catch(
            async err=>{
                await session.abortTransaction();
                session.endSession;
                next(err);
            }
           
        )
       
    }
}
module.exports = transaction;