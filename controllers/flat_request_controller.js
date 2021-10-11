const catchAsync = require("../util/catch_async");
const handlers = require('../controllers/handlers');
const User = require('../models/user_model');
const Building = require('../models/building_model');
const Flat = require('../models/flat_model');
const AppError = require("../util/app_error");
const FlatRequest = require("../models/flat_request_model");
const Response = require('../util/response');
const mongoose = require('mongoose');
const transaction = require("../util/transaction");


exports.createFlatRequest = catchAsync(async(req,res,next)=>{

    const userId = req.user._id;
    const {flatNo,bodyBuildingId} = req.body;
    const paramBuildingId = req.params.buildingId;
    //if request does not contains a building in the paramaters return error else  check if the request contains the same building in the body 
    // if so check if the building exists then go next  if not return error   
    if (!paramBuildingId) return next(new AppError("please use ../building/buildingId/..."),400);
       
    if(bodyBuildingId){
        if(paramBuildingId !== bodyBuildingId) return next(new AppError('building mismatch use matching building in your request',400));
    }
    
    const building = await Building.findById(paramBuildingId);
    
    if(!building) return next(new AppError('Building not found',404));
    // if flat exists create joinRequest if not create flatrequest
    req.body = {flatNo,building:paramBuildingId,user:userId};
    
    const flat = await Flat.findOne({building: paramBuildingId,flatNo});
    if(flat) req.body.flat = flat._id;

    return next(); 
    
});

exports.getMyFlatRequests = (req,res,next)=>{
    req.query.user = req.user._id;
    next();
}
exports.getMyFlatRequest = (req,res,next)=>{
    const filter = {_id: req.params.flatRequestId,user: req.user._id};
    handlers.getDocById(FlatRequest,filter,200)(req,res,next);
}

exports.cancelMyFlatRequest = (req,res,next)=>{
    req.body = {status: 'CANCELED'};
    const filter = {_id: req.params.flatRequestId,user: req.user._id};
    handlers.updateDocument(FlatRequest,filter)(req,res,next);
};

exports.getAllBuildingFlatRequests = (req,res,next)=>{
    req.query.building = (req.params.buildingId||req.body.buildingId);
    next();
}

exports.isMyBuilding = (req,res,next)=>{
    if (!req.params.buildingId && !req.body.buildingId ) throw(new AppError('No Building found in your request',400));
    if ((req.params.buildingId && req.body.buildingId) && (req.params.buildingId !== req.body.buildingId)) throw(new AppError('conflict building inputs',400));
    if(!req.user.buildingOwner || ! req.user.buildingOwner.includes((req.params.buildingId||req.body.buildingId))) throw(new AppError('You don\'t have permission to do this action',403 ));
    next();
}

exports.acceptBuildingFlatRequest = transaction(async (req,res,_,session)=>{
       
        const updateOptions = {
            runValidators: true,
            useFindAndModify: false,
            new: true,
            session: session
          }
        const request = await FlatRequest.findById(
            req.params.flatRequestId,null,
           // {respondedBy:req.user._id,status:'ACCEPTED'},
           {session}           
            );
        
        if(!request) throw (new AppError('Flat request not found ',404));

        request.accept(req.user);        
        request.save(session);

    
        const createdFlat =  new Flat(
            {building: request.building,owner:request.user ,flatNo : request.flatNo},
            null,
            {session}
            );
        await createdFlat.save({session});

        //serch for all flat requests for the same flat no. and update it with the flat created
        // converting all other flat requests into joinrequests

        const joinRequests = FlatRequest.updateMany(
            {building:request.building,flatNo:request.flatNo},{flat:createdFlat._id},
            updateOptions)
            
        
        await User.findByIdAndUpdate(request.user,
            {$addToSet:{flatOwner:createdFlat}},
            updateOptions
            );
        return res.status(201).json({
                        status :'success',
                        data: {request:request,flat: createdFlat,joinRequestsUpdated:joinRequests.nModified}
                    });
    
    }
)
exports.acceptFlatJoinRequest = transaction(async (req,res,_,session)=>{
       
    const updateOptions = {
        runValidators: true,
        useFindAndModify: false,
        new: true,
        session: session
      }
    const request = await FlatRequest.findById(
        req.params.flatRequestId,null,
        {session}          
        )
    
    if(!request) throw (new AppError('Flat request not found ',404));
        
    request.accept(req.user);
    request.save(session);

    const flat = await Flat.findByIdAndUpdate(
        request.flat,{
        $addToSet:{resedents:request.user}},
        updateOptions
        
        );   

    const user = await User.findByIdAndUpdate(request.user,
        {$addToSet:{flatResedent:flat._id}},
        updateOptions
        );
    return res.status(201).json({
                    status :'success',
                    data: {request: request,flat}
                });

}
)
exports.rejectBuildingFlatRequest = (req,res,next)=>{
    req.body = {respondedBy:req.user._id,status:'REJECTED'};
    next() ;
}
exports.rejectFlatJoinRequest = (req,res,next)=>{
    req.body = {respondedBy:req.user._id,status:'REJECTED'};
    next() ;
}
exports.isMyFlat = (req,res,next)=>{
    if(!req.params.flatId && !req.body.flatId) return next(new AppError('No flat found in your request',400));
    if ((req.params.flatId && req.body.flatId) && (req.params.flatId !== req.body.flatId)) return next(new AppError('conflict flat inputs',400));
    if(!req.user.flatOwner || !req.user.flatOwner.includes((req.params.flatId||req.body.flatId))) return next(new AppError('You don\'t have permission to do this action',403 ));
    next();

}

exports.getAllFlatJoinRequests = (req,res,next)=>{
    req.query.flat = (req.params.flatId || req.body.flatId);
    next();
    
}


exports.creatRawFlatRequest = handlers.createDocument(FlatRequest);

exports.getAllRawFlatRequests = handlers.getAllDocuments(FlatRequest);

exports.getOneRawFlatRequest = (req,res,next)=>{
    const filter = {_id : req.params.flatRequestId};
    handlers.getDocById(FlatRequest,filter,200)(req,res,next);
}


exports.updateRawFlatRequest = (req,res,next)=>{
    const filter = {_id : req.params.flatRequestId};
    handlers.updateDocument(FlatRequest,filter)(req,res,next);
}

exports.deletRawFlatRequest = (req,res,next)=>{
    const filter = {_id : req.params.flatRequestId};
    handlers.deleteOne(FlatRequest,filter,204)(req,res,next);
} 