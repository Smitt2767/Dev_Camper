const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../model/users");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorResponse("email and password both required...", 400));
  }
  const user = await User.create({
    name,
    email,
    password,
    role,
  });
  sendTokenResponse(user, 200, res);
});
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorResponse("email and password both required...", 400));
  }
  const user = await User.findOne({
    email,
  }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid email or password...", 401));
  }
  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return next(new ErrorResponse("Invalid email or password...", 401));
  }
  sendTokenResponse(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const { email, name } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      email,
      name,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: user,
  });
});
exports.updatePassword = asyncHandler(async (req, res, next) => {
  if (!req.body.password || !req.body.newPassword) {
    return next(new ErrorResponse("password and newPassword required...", 400));
  }
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(req.body.password))) {
    return next(new ErrorResponse("incorrect password", 401));
  }
  user.password = req.body.newPassword;
  await user.save({
    runValidators: false,
  });
  sendTokenResponse(user, 200, res);
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorResponse("please specify your email...", 400));
  }
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return next(new ErrorResponse("You are not registerd user...", 404));
  }
  //   GET reset token
  const resetToken = user.getResetPasswordToken();
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;
  const message = `You are receiving this email because you have requested to reset of password, please make a put request to : \n\n${resetUrl}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset...",
      message,
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({
      validateBeforeSave: false,
    });
    return next(new ErrorResponse("Email could not be sent...", 500));
  }
  await user.save({
    validateBeforeSave: false,
  });
  res.status(200).json({
    success: true,
    data: "Email sent...",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }
  //   set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  const token = user.generateToken();

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});
