const Flat = require('../models/flat_model');
const Building = require('../models/building_model');
const AppError = require('../util/app_error');
const catchAsync = require('../util/catch_async');
const handlers = require('./handlers');
const User = require('../models/user_model');

exports.createFlat = catchAsync(async(req,res,next)=>{
    const {buildingId,userId,flatNo} = req.body;

    let body = {flatNo};

    //const building = handlers.getDocById(Building,200)(req,res,next);

    const building = await Building.findById(buildingId);
    if(!building) return next(new AppError('Building not found',404));
    body.building = building._id;
    const user = await User.findById(userId).select('+profile -role');
    if(!user) return next(new AppError('user not found',404));
    body.owner = user._id;

    req.body = body;

    handlers.createDocument(Flat)(req,res,next);
    


});

exports.getAllFlats =  handlers.getAllDocuments(Flat);


exports.getFlat = handlers.getDocById(Flat,200);
exports.deletFlat = handlers.deleteOne(Flat,204);
exports.updateFlat = catchAsync(async(req,res,next)=>{
    const {flatNo} = req.body;
    let body = {flatNo};
    req.body = body;
    handlers.updateDocument(Flat)(req,res,next);
});