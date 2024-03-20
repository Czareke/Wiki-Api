const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");

const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
// creating a new user

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide a valid email and password", 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  // console.log(user)

  // Fixed
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) if everything is okay, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);

  if (!token) {
    return next(
      new AppError("You are not logged in! Pease log in to get access", 401)
    );
  }

  // 2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token does not exist.", 401)
    );
  }

  // 4) Check if the user changed password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401)
    );
  }

  // Grant access to protected  route
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ("admin", "user", "author")
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
      next()
    }
  };
};
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1 get posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no Email that Matches this", 404));
  }
  //2 generate random reset token
  const resetToken = user.createPasswordResetToken();
  try {
    await user.save({ validateBeforeSave: false });
    // 3 sent mail to user
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/resetPassword/${resetToken}`;
    const message = `Forgot password??SUbmit a patch request with your new password and passwordConfirm
  to :${resetURL}.\n if you did'nt forget your password kindly ignore this message`;
    console.log(message);
    await sendEmail({
      email: user.email,
      subject: "your password reset token (valid for 10 min)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "token has been sent to the above email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("there was an error sending mail"));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1)get user based token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // console.log(user);

  // 2)if token has'nt expired
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 404));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 3)update changed password
  await user.save();

  // 4)log user in,send jwt
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1)get the user from the database
  const user = await User.findById(req.user.id).select("+password");
  // user.findByAndUpdate will not work and won't validate encryption

  // 2)check if current password matches the same in the db
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("In-valid current password", 401));
  }
  // 3)if correct,update password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // 4)log user in,send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});
