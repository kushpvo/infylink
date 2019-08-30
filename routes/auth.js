const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/authController");
const isAuth = require("../middleware/is-auth");
const User = require("../models/userModel");

const router = express.Router();

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password should be minimum 6 characters")
  ],
  authController.postLogin
);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject(
              "Email already esists, please use a different email."
            );
          }
        });
      }),
    body("username").custom((value, { req }) => {
      return User.findOne({ username: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject(
            "Username already esists, please use a different username."
          );
        }
      });
    }),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password should be minimum 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords should match.");
      }
      return true;
    })
  ],
  authController.postSignup
);
router.post("/logout", authController.postLogout);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPassword);
router.post(
  "/new-password",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password should be minimum 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords should match.");
      }
      return true;
    })
  ],
  authController.postNewPassword
);
router.post(
  "/change-password",
  isAuth,
  [
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password should be minimum 6 characters"),
    body("newPasswordConfirm").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords should match.");
      }
      return true;
    })
  ],
  authController.postChangePassword
);

module.exports = router;
