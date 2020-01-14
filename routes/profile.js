/*
This code handles the site's home page.
*/

// Imports.
const express = require("express");

// Local imports.
const Finaliser = require("../lib/finaliser.js");

// Constants.
const router = express.Router();
const finaliser = new Finaliser();

// Return the home page.
router.get("/", function(req, res, next){
  var theTitle = "User: "+req.user.username;

  finaliser.protoRender(req, res, "profile",
                        { title: theTitle, user: req.user });
});

// Exports.
module.exports = router;
