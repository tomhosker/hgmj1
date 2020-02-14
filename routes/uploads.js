/*
Returns a table from the database, pretty much as is.
*/

// Imports.
const express = require("express");

// Local imports.
const Scraper = require("../lib/scraper.js");
const Uploader = require("../lib/uploader.js");
const Finaliser = require("../lib/finaliser.js");

// Constants.
const router = express.Router();
const scraper = new Scraper();
const uploader = new Uploader();
const finaliser = new Finaliser();

// Return the page for uploading to the JournalEntry table.
router.get("/upload2/JournalEntry", function(req, res, next){
  var theColumns = [{ name: "painScore", type: "number" },
                    { name: "remarks", type: "text" }];
  var action = "/uploads/insert2/JournalEntry";

  properties = { title: "Add a New Journal Entry", columns: theColumns,
                 formAction: action };
  finaliser.protoRender(req, res, "upload2table", properties);
});

// Execute an upload to the JournalEntry table.
router.post("/insert2/JournalEntry", function(req, res, next){
  uploader.insert(req, res, tableName);
});

module.exports = router;
