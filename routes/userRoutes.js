const express = require("express");
const userController = require("./../controller/userController");
const authController = require("../controller/authControler");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgetPassword", authController.forgetPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.patch("/updateMe", userController.updateMe);

router
  .route("/user")
  .get(userController.getAllUser)
  .post(userController.createUser);

router.use(authController.restrictTo("admin"));
router
  .route("/user/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
