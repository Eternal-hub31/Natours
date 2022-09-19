const CatchAsync = require('../Utilities/CATCHASYNC');
const APPERROR = require('../Utilities/APPERROR');
const APIFeatures = require('../Utilities/APIFeatures');

exports.deleteOne = (Model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new APPERROR('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.updateOne = (model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new APPERROR('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.createOne = (model) =>
  CatchAsync(async (req, res, next) => {
    const doc = await await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.getOne = (model, popOptions) =>
  CatchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new APPERROR('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.getAll = (model) =>
  CatchAsync(async (req, res, next) => {
    //Nesting hack
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // MAKE A CLASS
    const Features = new APIFeatures(model.find(filter), req.query)
      .fitler()
      .sort()
      .limitFields()
      .Pagination();
    // execute Query
    // const docs = await Features.query.explain();
    const docs = await Features.query;
    // SENDIND THE RES
    res.status(200).json({
      status: 'success',
      RequestAt: req.requestTime,
      results: docs.length,
      data: {
        Alldocs: docs,
      },
    });
  });
