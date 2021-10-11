const catchAsync = require('../util/catch_async');
const AppError = require('../util/app_error');
const Building = require('../models/building_model');
const User = require('../models/user_model');
const userController = require('./user_controller');
const handlers = require('./handlers');
const Response = require('../util/response');
const mongoose = require('mongoose');


exports.createProfile = async(req,res,next)=>{
    const response = new Response();
    const session = await mongoose.startSession();
    session.startTransaction();
    const filter = {_id : req.user._id};

    req.body = { owner : req.user._id , profile:req.body};

    const building = await handlers.createDocument(Building,session)(req,response,next); 

    req.body = {$addToSet:{buildingOwner:building}}

    const user = await handlers.updateDocument(User,filter,session)(req,response,next);

    if(session.transaction.state !=='TRANSACTION_ABORTED'){
        await session.commitTransaction();
        session.endSession()
    }

    return res.status(201).json({
        status :'success',
        data: building
    });

    
};

exports.getAllProfiles = (req,res,next)=>{
    req.query.fields = 'profile';
    next();

}

exports.getProfile = (req,res,next)=>{
    req.query.fields = 'profile';
    const filter = {_id : req.params.buildingId};
    handlers.getDocById(Building,filter,200)(req,res,next)

}
exports.updateProfile = (req,res,next)=>{
    req.query.fields = 'profile';
    const filter = {_id : req.params.buildingId, owner : req.user._id};
    req.body = {$set:{profile: req.body}};
    handlers.updateDocument(Building,filter)(req,res,next);

}


exports.createBuilding = handlers.createDocument(Building);

exports.getAllBuildings = handlers.getAllDocuments(Building);

exports.getBuildingById = (req,res,next)=>{
    const filter = {_id : req.params.buildingId};
    handlers.getDocById(Building,filter,200)(req,res,next)
}

exports.updateBuilding = (req,res,next)=>{
    const filter = {_id : req.params.buildingId};
    handlers.updateDocument(Building,filter)(req,res,next);
}

exports.deletBuilding = (req,res,next)=>{
    const filter = {_id : req.params.buildingId};
    handlers.deleteOne(Building,filter,204)(req,res,next);
}