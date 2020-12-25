const Bootcamp = require("../model/Bootcamps");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id} ...`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user._id;

  // check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({
    user: req.user._id,
  });
  // if user is not admin then they can only add one bootcamp...
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `user with name ${req.user.name} has already published bootcamp...`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id} ...`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `${req.user.name} is not authorized to update this bootcamp...`,
        401
      )
    );
  }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id} ...`, 404)
    );
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `${req.user.name} is not authorized to delete this bootcamp...`,
        401
      )
    );
  }
  bootcamp.remove();
  res.status(204).json({
    status: true,
    data: {},
  });
});
exports.getBootcampsWithInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // calc radius using radians
  // divide dist by radius of earth
  // Earth radius = 3963 mi, 6378.1 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });
  res.status(200).json({
    success: true,
    counts: bootcamps.length,
    data: bootcamps,
  });
});

exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id} ...`, 404)
    );
  }
  if (bootcamp.user.toString() !== req.user.id || bootcamp.role !== "admin") {
    return next(
      new ErrorResponse(
        `${req.user.name} is not authorized to upload photo for this bootcamp...`,
        401
      )
    );
  }
  if (!req.files) {
    return next(new ErrorResponse("Please upload file...", 400));
  }
  const file = req.files.file;

  if (!file.mimetype.startsWith("image/")) {
    return next(new ErrorResponse("Please upload an image file...", 400));
  }
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(`Please upload an image less than 1mb...`, 400)
    );
  }
  // create custom file name
  file.name = `${bootcamp._id}_${file.name}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse("problem with file upload...", 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name,
    });
  });
  res.status(200).json({
    success: true,
    data: file.name,
  });
});
