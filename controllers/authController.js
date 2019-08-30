const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const { validationResult } = require("express-validator");

const User = require("../models/userModel");

const SENDGRID_API_KEY =
  "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";

sgMail.setApiKey(SENDGRID_API_KEY);

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success")
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      successMessage: req.flash("success")
    });
  }
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        // user not found
        req.flash("error", "Invalid email, please try again.");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            if (user.isAdmin) {
              req.session.isAdmin = true;
            }
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              if (err) {
                console.log(err);
              }
              req.flash("success", "Successfully loggedin!");
              res.redirect("/dashboard");
            });
          }
          //   wrong password
          req.flash("error", "Invalid password, please try again.");
          res.redirect("/login");
        })
        .catch(err => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: req.flash("error"),
    successMessage: req.flash("success")
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      successMessage: req.flash("success")
    });
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        name: name,
        email: email,
        username: username,
        password: hashedPassword,
        links: []
      });
      return user.save();
    })
    .then(result => {
      req.flash("success", "Account created. Please login below!");
      res.redirect("/login");
      const msg = {
        to: email,
        from: "support@infy.link",
        subject: "Welcome to Infy Link!",
        html:
          "<h1>You have successfully signed up!</h1><strong>Welcome to Infy Link!</strong><p>Please click <a href='https://infy.link/login' target='_blank'>here</a> to login</p>"
      };
      return sgMail.send(msg);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect("/login");
  });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: req.flash("error")
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash("error", "No account associated with that email!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 1000 * 60 * 60;
        return user
          .save()
          .then(resutl => {
            req.flash("success", "Password reset link sent to email.");
            res.redirect("/login");
            const msg = {
              to: req.body.email,
              from: "support@infy.link",
              subject: "Password Reset",
              html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="https://infy.link/reset/${token}">link</a> to set a new password. The link is valid only for 1 hour.</p>
                `
            };
            return sgMail.send(msg);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      if (!user) {
        req.flash("error", "Invalid Token!");
        return res.redirect("/login");
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: req.flash("error"),
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const errors = validationResult(req);
  const passwordToken = req.body.passwordToken;
  const backURL = `/reset/${passwordToken}`;
  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.redirect(backURL);
  }
  const newPassword = req.body.password;
  const userId = req.body.userId;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      req.flash("success", "Password reset successfully!");
      return res.redirect("/login");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postChangePassword = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("dashboard", {
      pageTitle: "Dashboard",
      path: "/dashboard",
      userData: req.user,
      editing: false,
      successMessage: req.flash("success"),
      errorMessage: errors.array()[0].msg
    });
  }
  const newPassword = req.body.newPassword;
  bcrypt
    .hash(newPassword, 12)
    .then(hashedPassword => {
      req.user.password = hashedPassword;
      return req.user.save();
    })
    .then(result => {
      req.flash("success", "Password changed successfully!");
      return res.redirect("/dashboard");
    })
    .catch(err => {
      console.log(err);
    });
};
