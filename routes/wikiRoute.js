const express = require("express");
const wikiController = require("./../controller/wikiController");
const authController = require("../controller/authControler");

const router = express.Router();

router
  .route("/article")
  .get(authController.protect, wikiController.getAllArticles)
  .post(
    authController.protect,
    authController.restrictTo("author"),
    wikiController.createArticle
  );

router
  .route("/article/:id")
  .get(authController.protect, wikiController.getOneArticle)
  .patch(
    authController.protect,
    authController.restrictTo("author", "admin"),
    wikiController.updateArticle
  )
  .delete(
    authController.protect,
    authController.restrictTo("author", "admin"),
    wikiController.deleteArticle
  );

module.exports = router;
