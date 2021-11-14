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
router.get("/upload2/JournalEntry", function (req, res, next) {
    var theColumns = [
        { name: "painScore", type: "number" },
        { name: "remarks", type: "text" }
    ];
    var action = "/uploads/insert2/JournalEntry";
    let properties = {
        title: "Add a New Journal Entry",
        columns: theColumns,
        formAction: action
    };

    finaliser.protoRender(req, res, "upload2table", properties);
});

// Return the page for a SPECIAL upload to the JournalEntry table.
router.get("/upload2/JournalEntry/special", function (req, res, next) {
    var theColumns = [
        { name: "timeStamp", type: "datetime-local" },
        { name: "painScore", type: "number" },
        { name: "remarks", type: "text" }
    ];
    var action = "/uploads/insert2/JournalEntry/special";

    properties = {
        title: "Add a New Journal Entry Retroactively",
        columns: theColumns,
        formAction: action,
        isSpecial: true
    };
    finaliser.protoRender(req, res, "upload2table", properties);
});

// Return the page for a BULK upload to the JournalEntry table.
router.get("/upload2/JournalEntry/bulk", function (req, res, next) {
    var theColumns = [];
    var action = "/uploads/insert2/JournalEntry/bulk";

    properties = {
        title:
            "Fill the Gap in the Journal between the Last " + "Entry and Now",
        columns: theColumns,
        formAction: action,
        isSpecial: true
    };
    finaliser.protoRender(req, res, "upload2table", properties);
});

// Execute an upload to the JournalEntry table.
router.post("/insert2/JournalEntry", function (req, res, next) {
    uploader.insertNewJournalEntry(req, res, "JournalEntry");
});

// Execute a SPECIAL upload to the JournalEntry table.
router.post("/insert2/JournalEntry/special", function (req, res, next) {
    uploader.insertNewJournalEntrySpecial(req, res, "JournalEntry");
});

// Execute a BULK upload to the JournalEntry table.
router.post("/insert2/JournalEntry/bulk", function (req, res, next) {
    uploader.bulkFillInterval(req, res, "JournalEntry");
});

module.exports = router;
