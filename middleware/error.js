const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  // log to console for dev
  if (process.env.NODE_ENV === "development") console.log(err.stack.red);
  // Mongoose bad objectID
  if (err.name === "CastError") {
    const message = `No resourse found...`;
    error = new ErrorResponse(message, 404);
  }
  // Mongoose Duplicate key
  if (err.code === 11000) {
    let message;
    if (err.keyValue.bootcamp && err.keyValue.user) {
      message = `user with id <${err.keyValue.user}> has already created review for bootcamp <${err.keyValue.bootcamp}>`;
    } else {
      message = `Resourse with value {${
        err.keyValue.name || err.keyValue.email
      }} already created before...`;
    }
    error = new ErrorResponse(message, 400);
  }
  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Internal server error...",
  });
};
module.exports = errorHandler;
