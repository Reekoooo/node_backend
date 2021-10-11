const User = require('../models/user_model');
const AppError = require('../util/app_error');
const catchAsync = require('../util/catch_async');
const handlers = require('./handlers');


exports.updateMe = catchAsync(async(req,res,next)=>{
    //console.log(req);
    //const{firstName,lastName}  = req.body;
    const profile = req.body.profile;
    if(req.file)    profile.profileImage = req.file.path; 
    const user = await User.findByIdAndUpdate(
        req.user._id ,
        {profile},
        {runValidators:true,new: true,useFindAndModify: false }
    );
    
    if(!user) return next(new AppError('User not found!',404));

    res.status(200).json({
        status: 'success',
        data: {user}
    });
});



exports.createUser = handlers.createDocument(User);

exports.getAllUsers = handlers.getAllDocuments(User);

exports.getUserById = (req,res,next)=>{
    const filter = {_id : req.params.userId};
    handlers.getDocById(User,filter,200)(req,res,next);
}

exports.deletUser = (req,res,next)=>{
    const filter = {_id : req.params.userId};
    handlers.deleteOne(User,filter,204)(req,res,next);
}
    
exports.updateUser = (req,res,next)=>{
    const filter = {_id : req.params.userId};
    handlers.updateDocument(User,filter)(req,res,next);
}
