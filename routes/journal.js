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

// Return the page for the whole journal.
router.get("/", function(req, res, next){
  scraper.fetchJournal(req, res);
});

// Return the page for the most recent journal entries.
router.get("/", function(req, res, next){
  scraper.fetchRecent(req, res);
});

module.exports = router;
