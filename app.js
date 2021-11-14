/*************************
 ** SET UP LOG IN SYSTEM **
 *************************/

// Login imports.
const passport = require("passport");
const Strategy = require("passport-local").Strategy;
const signingin = require("./signingin");

// Configure the local strategy for use by Passport.
passport.use(
    new Strategy(function (username, password, cb) {
        signingin.users.findByUsername(username, function (err, user) {
            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password != password) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    })
);

// Configure Passport authenticated session persistence.
passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});
passport.deserializeUser(function (id, cb) {
    signingin.users.findById(id, function (err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});

/***************************
 ** SET UP EVERYTHING ELSE **
 ***************************/

// Imports.
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const favicon = require("express-favicon");
const dotenv = require("dotenv").config();

// Local imports.
const indexRouter = require("./routes/index");
const stillsRouter = require("./routes/stills");
const profileRouter = require("./routes/profile");
const asIsRouter = require("./routes/asis");
const journalRouter = require("./routes/journal");
const uploadsRouter = require("./routes/uploads");

// Error codes.
const notFound = 404;
const internalServerError = 500;

// Let's get cracking.
const app = express();

// "View" engine setup.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
if (app.get("env") === "development") app.locals.pretty = true;
// Un-commenting the following makes the HTML output human-readable in all
// cases. (Useful when debugging a non-local server.)
app.locals.pretty = true;

// Use application-level middleware for common functionality, including
// parsing and session handling.
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
    require("express-session")({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false
    })
);

// Initialise Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Initialise some other resources.
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(__dirname + "/public/favicon.ico"));

// ROUTES.
app.use("/", indexRouter);
app.use(
    "/profile",
    require("connect-ensure-login").ensureLoggedIn(),
    profileRouter
);
app.use("/asis", require("connect-ensure-login").ensureLoggedIn(), asIsRouter);
app.use("/stills", stillsRouter);
app.use(
    "/uploads",
    require("connect-ensure-login").ensureLoggedIn(),
    uploadsRouter
);
app.get("/login", function (req, res) {
    res.redirect("/");
});
app.post(
    "/login",
    passport.authenticate("local", { failureRedirect: "/login" }),
    function (req, res) {
        res.redirect("/");
    }
);
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});
app.use(
    "/journal",
    require("connect-ensure-login").ensureLoggedIn(),
    journalRouter
);

// Catch 404 and forward to error handler.
app.use(function (req, res, next) {
    next(createError(notFound));
});

// Error handler.
app.use(function (err, req, res, next) {
    // Set locals, only providing error in development.
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // Render the error page.
    res.status(err.status || internalServerError);
    res.render("error");
});

// Tell the user where to find the website.
app.listen(app.get("port"), function () {
    console.log("App running at port number: " + app.get("port"));
    console.log(
        "If running locally, navigate to: http://localhost:" +
            app.get("port") +
            "/"
    );
});

// Exports.
module.exports = app;
