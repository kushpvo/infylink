const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");

const User = require("../models/userModel");

const controller = require("../controllers/controller");
const isAdmin = require("../middleware/is-admin");
const isAuth = require("../middleware/is-auth");

router.get("/", controller.getIndex);
router.get("/changelog", controller.getChangelog);
router.get("/admin", isAdmin, controller.getAdmin);
router.get("/dashboard", isAuth, controller.getDashboard);
router.post("/add-link", isAuth, controller.postAddLink);
router.post("/delete-link", isAuth, controller.postDeleteLink);
router.get("/edit-link/:linkId", isAuth, controller.getEditLink);
router.post("/edit-link", isAuth, controller.postEditLink);
router.post("/toggle-highlight", isAuth, controller.postToggleHighlight);
router.get("/admin/user/:userId/links", isAdmin, controller.getUserLinks);
router.post(
  "/change-username",
  isAuth,
  [
    body("newUsername").custom((value, { req }) => {
      return User.findOne({ username: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject(
            "Username already exists, please use a different username"
          );
        }
      });
    })
  ],
  controller.postChangeUsername
);

router.get("/:username", controller.getDisplay);

module.exports = router;
