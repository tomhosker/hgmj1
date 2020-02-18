/*
Returns the home page.
*/

// Imports.
const express = require("express");

// Local imports.
const Finaliser = require("../lib/finaliser.js");

// Constants.
const router = express.Router();
const finaliser = new Finaliser();

// GET home page.
router.get("/", function(req, res, next){
  var isLoggedIn = true;
  var isAdmin = false;

  if(req.user === undefined) isLoggedIn = false;
  else if(req.user.username === "admin") isAdmin = true;

  finaliser.protoRender(req, res, "index",
                        { title: "Welcome",
                          loggedIn: isLoggedIn, isAdmin: isAdmin });
});

module.exports = router;
