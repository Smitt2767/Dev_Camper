const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../model/reviews");
const Bootcamp = require("../model/Bootcamps");
// GET /api/v1/reviews
// GET /api/v1/bootcamps/:bootcampID/reviews
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampID) {
    const reviews = await Review.find({
      bootcamp: req.params.bootcampID,
    });
    res.status(200).json({
      success: true,
      counts: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    return next(
      new ErrorResponse(`No review found with id ${req.params.id} ...`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: review,
  });
});
exports.createReview = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampID);
  req.body.user = req.user._id;
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id} ...`, 404)
    );
  }
  req.body.bootcamp = bootcamp._id;

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);
  if (!review) {
    return next(
      new ErrorResponse(`No review found with id ${req.params.id} ...`, 404)
    );
  }
  if (review.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `${req.user.name} is not authorized to update this review ...`,
        401
      )
    );
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: review,
  });
});
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No course found with id ${req.params.id} ...`, 404)
    );
  }
  if (review.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `${req.user.name} is not authorized to delete this review ...`,
        401
      )
    );
  }
  review.remove();
  res.status(204).json({
    status: true,
    data: {},
  });
});
