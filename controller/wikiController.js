const Article = require("../models/wikiModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError")

exports.getAllArticles = catchAsync(async (req, res, next) => {
  const articles = await Article.find();
  res.status(200).json({
    status: "success",
    results: articles.length,
    data: {
      articles,
    },
  });
});

// exports.getOneArticle = catchAsync(async (req, res, next) => {
//   const article = await Article.findOne({ title: req.params.title });
//   if (!article) {
//     return next(new Error("No article found with that title"));
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       article,
//     },
//   });
// });



exports.createArticle = catchAsync(async (req, res, next) => {
  const { title, content, author } = req.body;

  // if (!title || !content || !author) {
  //   return new AppError("Missing required fields", 400);
  //   // return res
  //   //   .status(400)
  //   //   .json({ status: "fail", message: "Missing required fields" });
  // }

  const newArticle = await Article.create({ title, content, author });
  res.status(201).json({
    status: "success",
    data: {
      article: newArticle,
    },
  });
});

exports.updateArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!article) {
    return next(new AppError("No article found with that ID", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      article,
    },
  });
});

exports.deleteArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findByIdAndDeleted(req.params.id);
  if (!article) {
    return next(new AppError("No article found with that ID", 400));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getOneArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);
  if (!article) {
    return next(new AppError("No article found with that id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      article,
    },
  });
});