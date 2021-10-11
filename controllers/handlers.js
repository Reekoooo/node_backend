const catchAsync = require("../util/catch_async");
const AppError = require("../util/app_error");

exports.getAllDocuments = (Model) =>
  catchAsync(async (req, res, next) => {
    const queryObj = { ...req.query };

    //Execlude keys sort page limit fields
    const execludedFields = ["sort", "page", "limit", "fields"];
    execludedFields.forEach((el) => delete queryObj[el]);

    // fix the operator string $
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Model.find(JSON.parse(queryStr));
    console.log(JSON.parse(queryStr));

    if (req.query.sort) {
      const sortedBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortedBy);
    } else {
      query = query.sort("-createdAt");
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const allDocements = await query;
    return res.status(200).json({
      status: "success",
      data: allDocements,
    });
  });

exports.createDocument = (Model,session) =>
  catchAsync(async (req, res, next) => {
   
    const document = new Model(req.body,null,{session});
    const savedDocument = await document.save({session});
    return res.status(201).json({
      status: "success",
      data: savedDocument,
    });
  },session);
  
exports.getDocById = (Model, filter, status) =>
  catchAsync(async (req, res, next) => {
    const documemt = await Model.findOne(filter);
    if (!documemt) return next(new AppError("Doc not found", 404));
    return res.status(status).json({
      status: "success",
      data: documemt,
    });
  });

exports.updateDocument = (Model,filter,session) =>
  catchAsync(async (req, res, next) => {
    const updatedDocument = await Model.findOneAndUpdate(filter, req.body, {
      runValidators: true,
      useFindAndModify: false,
      new: true,
      session: session
    })
   // throw(new AppError('artificial error ',400))
    if (!updatedDocument) return next(new AppError("Document not found", 404));
    return res.status(202).json({
      status: "success",
      data: updatedDocument,
    });
  },session);

  
exports.deleteOne = (Model, filter, status) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.deleteOne(filter);
    if (document.deletedCount === 0)
      return next(new AppError("document not found", 404));
    return res.status(status).json({
      status: "success",
      data: document,
    });
  });
