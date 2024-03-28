const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
// get all users
exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
// get one user
exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No User found with Id", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.createUser = async (req, res) => {
  res.send("User Created");
};
exports.updateUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No user found with ID", 400));
  }
  res.status(200).json({
    status: "Success",
  });
});
exports.deleteUser = catchAsync(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No user found with ID", 400));
  }
  res.status(204).json({
    status: "Success",
    data: null,
    message: "User Deleted",
  });
});
// allowed fields is to restrict what the user can update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1)create error if user post password data
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        "this is not for Password updates,please use updateMyPassword",
        400
      )
    );
  }

  // 2)filter for unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "firstName", "lastName", "email");
  // 3)update user doc
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: "null",
  });
});
