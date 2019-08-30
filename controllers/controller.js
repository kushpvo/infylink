const User = require("../models/userModel");

const { validationResult } = require("express-validator");

exports.getIndex = (req, res, next) => {
  res.redirect("/dashboard");
};

exports.getChangelog = (req, res, next) => {
  res.render("changelog", {
    pageTitle: "Changelog",
    path: "/changelog"
  });
};

exports.getDashboard = (req, res, next) => {
  res.render("dashboard", {
    pageTitle: "Dashboard",
    path: "/dashboard",
    userData: req.user,
    editing: false,
    successMessage: req.flash("success"),
    errorMessage: req.flash("error")
  });
};

exports.postAddLink = (req, res, next) => {
  const title = req.body.title;
  const url = req.body.url;
  const highlight = req.body.highlight;
  const linkData = {
    title: title,
    url: url,
    highlight: highlight
  };
  req.user
    .addLinkToUser(linkData)
    .then(result => {
      res.redirect("/dashboard");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getDisplay = (req, res, next) => {
  const username = req.params.username;
  User.find({ username: username }).then(user => {
    if (user.length == 0) {
      res.status(404).render("404", {
        pageTitle: "Page Not Found",
        path: "/404"
      });
    } else {
      const userData = user[0];
      res.render("display", {
        pageTitle: user.username,
        path: "/display",
        userData: userData
      });
    }
  });
};

exports.postDeleteLink = (req, res, next) => {
  const linkId = req.body.linkId;
  req.user
    .removeLinkFromUser(linkId)
    .then(result => {
      res.redirect("/dashboard");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditLink = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/dashboard");
  }
  const linkId = req.params.linkId;
  const link = req.user.links.filter(link => {
    return link._id.toString() === linkId.toString();
  })[0];
  res.render("dashboard", {
    pageTitle: "Dashboard",
    path: "/dashboard",
    editing: editMode,
    link: link,
    userData: req.user,
    successMessage: req.flash("success"),
    errorMessage: req.flash("error")
  });
};

exports.postEditLink = (req, res, next) => {
  const linkId = req.body.linkId;
  const updatedTitle = req.body.title;
  const updatedUrl = req.body.url;
  const updatedHighlight = req.body.highlight;
  req.user
    .updateLink(linkId, updatedTitle, updatedUrl, updatedHighlight)
    .then(result => {
      res.redirect("/dashboard");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postToggleHighlight = (req, res, next) => {
  const linkId = req.body.linkId;
  req.user
    .toggleHighlight(linkId)
    .then(result => {
      res.redirect("/dashboard");
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getAdmin = (req, res, next) => {
  User.find()
    .then(users => {
      res.render("admin", {
        pageTitle: "Admin Dashboard",
        path: "/admin",
        users: users
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getUserLinks = (req, res, next) => {
  const userId = req.params.userId;
  User.findById(userId)
    .then(user => {
      res.render("userLinks", {
        pageTitle: user.username,
        path: "/admin",
        user: user
      });
    })
    .catch(err => {
      console.log(err);
      res.status(404).render("404", {
        pageTitle: "Page Not Found",
        path: "/404"
      });
    });
};

exports.postChangeUsername = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("dashboard", {
      path: "/dashboard",
      pageTitle: "Dashboard",
      errorMessage: errors.array()[0].msg,
      successMessage: req.flash("success"),
      userData: req.user,
      editing: false
    });
  }
  const newUsername = req.body.newUsername;
  req.user.username = newUsername;
  req.user
    .save()
    .then(result => {
      req.flash("success", `Username changed to: ${newUsername}`);
      return res.redirect("/dashboard");
    })
    .catch(err => {
      console.log(err);
    });
};
