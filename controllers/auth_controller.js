const {promisify} = require('util');
const AppError = require('../util/app_error');
const catchAsync = require('../util/catch_async');
const sendEmail = require('../util/mail');
const User = require('../models/user_model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.login = catchAsync(async(req,res,next)=>{
    const {email,password,fcm} = req.body;

    if(!email || !password){
        return next(new AppError('email and password required!',400));
    }
    const userExists = await User.findOne({ email }).select('+password')
    .populate('buildingOwner')
    .populate('flatOwner')
    .populate('flatResident');

    if(userExists) {
        
        
        const correct = await userExists.correctPassword(password,userExists.password);
        
        if (correct){
            const payLoad = {uid: userExists._id, exp : Date.now()+ 60*60};
            const token = jwt.sign(payLoad,process.env.JWT_SECRET);
            userExists.password = undefined;
            if(fcm) await User.findByIdAndUpdate(userExists._id,{$addToSet: {fcm:fcm}},{useFindAndModify :false});
            return res.status(200).json({
                status: "success",
                data: {token,user : userExists}
            });

        };
    };

    return next(new AppError('wrong email or password',401));
    
});
exports.logout = catchAsync(async(req,res,next)=>{
    const fcm =req.body.fcm; 
    if (fcm) await User.findByIdAndUpdate(req.user._id,{$pull: {fcm:fcm}},{useFindAndModify :false});
    return res.status(204).json({
        status:'success'
    });


});

exports.signup = catchAsync(async(req,res,next)=>{
    const {email,password,passwordConfirm,fcm} = req.body;
   
    const userExists = await User.findOne({ email })
    .populate('buildingOwner')
    .populate('flatOwner')
    .populate('flatResident');

    if (!userExists) {

        const user = new User({ email, password ,passwordConfirm,fcm: [fcm]});
        // if(fcm) await User.findByIdAndUpdate(userExists._id,{$addToSet: {fcm:fcm}},{useFindAndModify :false});


        
        const savedUser = await user.save();

        const payLoad = {uid: savedUser._id,exp : Date.now()+ 60*60};

        const token = jwt.sign(payLoad,process.env.JWT_SECRET);

        return res.status(201).json({
            status: "success",
            data: {token,user : savedUser}
        });

    };

    return next(new AppError('Already signed up',409));

});

exports.protect = catchAsync(async(req,res,next)=>{
    let token;
    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ){
        token = req.headers.authorization.split(' ')[1];
    };

    if(!token){
        return next(new AppError('you are not logged in',401));
    }

    // verify token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    // check if user still exists
    const currentUser = await User.findOne({_id: decoded.uid});
    
    if (!currentUser){
        return next(new AppError('User doesn\'t exist ',401));
    }
    
    // check if user changed password after the token was issued 
    if(currentUser.passwordChangedAt){
        if(currentUser.changedPasswordAfter(decoded.iat)){
            return next(new AppError('user changed password recently !',401));
        };
    }
    req.user = currentUser;
    next();

});

exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        if (!roles.includes(req.user.role)){
            return next(new AppError('You don\'t have permission to perform this action !',403));
        }
        return next();
    };
};

exports.forgotPassword = catchAsync(async(req,res,next)=>{
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('email not found',404));
    };
    const passwordResetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});

    const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword/${passwordResetToken}`;

    const message = `Forgot your password ?\n
     please,submit a patch request with your new password and passwordConform to ${resetURL} .\n
     If you didn't forget your password, please ignore this email.`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('There was an error sending email! please,try again later',500));
    };

    res.status(200).json({
        status: 'success',
        message: 'Token sent to your email'
    });


});
exports.resetPassword = catchAsync(async(req,res,next)=>{
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
    });

    if(!user){
        return next(new AppError('Invalid or Expired token',400));
    };

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const payLoad = {uid: user._id,exp : Date.now()+ 60*60};

    const token = jwt.sign(payLoad,process.env.JWT_SECRET);

    return res.status(200).json({
        status: "success",
        data: token
    });


});

exports.updatePassword = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user._id).select('+password');
    if(!await user.correctPassword(req.body.currentPassword,user.password)) return next(new AppError('Invalid password !',401));
    
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    const payLoad = {uid: user._id,exp : Date.now()+ 60*60};

    const token = jwt.sign(payLoad,process.env.JWT_SECRET);

    return res.status(200).json({
        status: "success",
        data: token
    });
    
});

exports.updateEmail = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user._id).select('+password');
    const currentPassword = req.body.currentPassword;
    
    const correctPassword =  user.correctPassword(currentPassword,user.password)
    if( !currentPassword || !await correctPassword) return next(new AppError('Invalid password !',401));
    await User.findByIdAndUpdate(req.user._id,{email: req.body.email},{runValidators:true,useFindAndModify: false});

    const payLoad = {uid: user._id,exp : Date.now()+ 60*60};
    const token = jwt.sign(payLoad,process.env.JWT_SECRET);

    return res.status(200).json({
        status: "success",
        data: token
    });

});