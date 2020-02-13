/*
Returns a table from the database, pretty much as is.
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

// Return the page for uploading to the JournalEntry table.
router.get("/upload2/JournalEntry", function(req, res, next){
  var theColumns = [{ name: "painScore", type: "number" },
                    { name: "remarks", type: "text" }];
  var action = "/boxeyecomponents/insert2/boxeyerig";

  properties = { title: "Upload to BoxEyeRig", columns: theColumns,
                 formAction: action };
  finaliser.protoRender(req, res, "upload2table", properties);
});

module.exports = router;
