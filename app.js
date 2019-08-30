// NODEJS CORE MODULES
const path = require("path");
const fs = require("fs");

// THIRD PARTY MODULES
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
// const enforce = require("express-sslify");

const errorController = require("./controllers/errorController");
const User = require("./models/userModel");

const MONGODB_URI = process.env.MONGO_URI;

const app = express();
const store = new MongoDBStore({ uri: MONGODB_URI, collections: "sessions" });
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

// MY IMPORTS - ROUTE FILES
const routes = require("./routes/routes");
const authRoutes = require("./routes/auth");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// app.use(enforce.HTTPS({ trustProtoHeader: true }));
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
// SERVING PULBIC FOLDER STATICALLY
app.use(express.static(path.join(__dirname, "public")));

// SESSION MIDDLEWARE
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

// MIDDLEWARE
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      console.log(err);
    });
});

// Passing on variables/values to all the rendered views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.isAdmin = req.session.isAdmin;
  next();
});

// ROUTES
app.use(authRoutes);
app.use(routes);
app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false })
  .then(result => {
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server started");
    });
  })
  .catch(err => {
    console.log(err);
  });
