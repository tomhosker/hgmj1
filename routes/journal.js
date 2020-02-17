/*
Access pages to do with the journal itself.
*/

// Imports.
const express = require("express");

// Local imports.
const Scraper = require("../lib/scraper.js");
const Finaliser = require("../lib/finaliser.js");

// Constants.
const router = express.Router();
const scraper = new Scraper();
const finaliser = new Finaliser();

// Return the page for a given table.
router.get("/", function(req, res, next){
  scraper.fetchJournal(req, res);
});

module.exports = router;
