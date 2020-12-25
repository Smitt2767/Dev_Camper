const Course = require("../model/courses");
const Bootcamp = require("../model/Bootcamps");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// GET /api/v1/courses
// GET /api/v1/bootcamps/:bootcampID/courses
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampID) {
    const courses = await Course.find({
      bootcamp: req.params.bootcampID,
    }).populate({
      path: "bootcamp",
      select: "name description",
    });
    res.status(200).json({
      success: true,
      counts: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course found with id ${req.params.id} ...`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: course,
  });
});
exports.createCourse = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.bootcampID);
  req.body.user = req.user._id;
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id} ...`, 404)
    );
  }
  req.body.bootcamp = bootcamp._id;

  if (
    bootcamp.user._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        `${req.user.name} is not authorized to add course to ${bootcamp.name}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course found with id ${req.params.id} ...`, 404)
    );
  }
  if (course.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `${req.user.name} is not authorized to update this course ...`,
        401
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: course,
  });
});
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course found with id ${req.params.id} ...`, 404)
    );
  }
  if (course.user._id.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `${req.user.name} is not authorized to delete this course ...`,
        401
      )
    );
  }
  course.remove();
  res.status(204).json({
    status: true,
    data: {},
  });
});
