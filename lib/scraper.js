/*
This code holds a class which scrapes the required data from a database.
*/

// Imports.
const PG = require("pg");

// Local imports.
const Finaliser = require("./finaliser.js");

// Local constants.
const Client = PG.Client;
const millisecondsInASecond = 1000;
const secondsInSevenDays = 60*60*24*7;

// The class in question.
class Scraper
{
    constructor()
    {
        this.finaliser = new Finaliser();
    }

    fetchAsIs(req, res)
    {
        var tableName = req.params.id;

        this.checkTableName(req, res, tableName);
    }

    // Fetch all data from the Journal Entry table.
    fetchJournal(req, res)
    {
        var that = this;
        var title = "The Journal";
        var queryString = "SELECT * FROM JournalEntry "+
                          "ORDER BY theTimeStamp ASC;";
        var extract, data;
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true
            //ssl: { rejectUnauthorized: false }
        });

        client.connect();
        client.query(queryString, (err, result) => {
            if(err) throw err;

            extract = result.rows;
            data = interpretJournalExtract(extract);
            data = objectifyExtract(data);
            client.end();
            that.finaliser.protoRender(req, res, "tabular",
                                       { title: title, data: data });
        });
    }

    // Fetch the most recent data from the Journal Entry table.
    fetchRecent(req, res)
    {
        const sevenDaysAgo = Math.round(Date.now()/millisecondsInASecond)-
                             secondsInSevenDays;
        var that = this;
        var title = "Recent Journal Entries";
        var queryString = "SELECT * FROM JournalEntry "+
                          "WHERE theTimeStamp > "+sevenDaysAgo+" "+
                          "ORDER BY theTimeStamp ASC";
        var extract, data;
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true
        });

        client.connect();
        client.query(queryString, (err, result) => {
            if(err) throw err;
            extract = result.rows;
            data = interpretJournalExtract(extract);
            data = objectifyExtract(data);
            client.end();

            that.finaliser.protoRender(req, res, "tabular",
                                       { title: title,    data: data });
        });
    }

    // Fetches a list of table names, and checks the table name in question
    // against it.
    checkTableName(req, res, tableName)
    {
        var that = this;
        var queryString = "SELECT table_schema, table_name "+
                          "FROM information_schema.tables "+
                          "WHERE table_type = 'BASE TABLE';";
        var extract;
        var tableNames = [];
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true
        });

        client.connect();
        client.query(queryString, (err, result) => {
            if(err) throw err;

            extract = result.rows;
            client.end();

            if(checkTableName(tableName, extract) === false)
            {
                res.send("Bad table name: "+tableName);
            }
            else that.fetchAsIsPart2(req, res, tableName);
        });
    }

    // Fetches a table from the database as is.
    fetchAsIsPart2(req, res, tableName)
    {
        var that = this;
        var queryString = "SELECT * FROM "+tableName+";";
        var extract, data;
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true
        });

        client.connect();
        client.query(queryString, (err, result) => {
            if(err) throw err;

            extract = result.rows;
            client.end();

            data = objectifyExtract(extract);

            that.finaliser.protoRender(req, res, "asis",
                                       { title: tableName,    data: data });
        });
    }
};

// Turn an extract from the database into a useful object.
function objectifyExtract(extract)
{
    var columns, rows;
    var result = {};

    if((extract === null) || (extract.length === 0)) return null;

    columns = Object.keys(extract[0]);
    rows = dictToRows(extract);

    result.columns = columns;
    result.rows = rows;

    return result;
}

// Extract the rows from a list of dictionaries.
function dictToRows(list)
{
    var result = [];
    var row = [];

    for(var i = 0; i < list.length; i++)
    {
        row = Object.values(list[i]);
        result.push(row);
    }

    return result;
}

// Checks the validity of a given table name.
function checkTableName(tableName, extract)
{
    var nameToBeChecked;

    for(var i = 0; i < extract.length; i++)
    {
        if(extract[i].table_schema === "public")
        {
            if(tableName.toLowerCase() === extract[i].table_name)
            {
                return true;
            }
        }

        nameToBeChecked = extract[i].table_schema+"."+extract[i].table_name;

        if(tableName.toLowerCase() === nameToBeChecked) return true;
    }

    return false;
}

// Adds links to foreign keys.
function linkifyExtract(extract, linkField, linkStem)
{
    var row;

    for(var i = 0; i < extract.length; i++)
    {
        row = extract[i];
        // Link stem should end with a "/".
        row[linkField] = "<a href=\""+linkStem+row[linkField]+"\">"+
                         row[linkField]+"</a>";
    }

    return extract;
}

// Replaces epoch times with ISO formated date strings.
function addISODates(extract)
{
    var reee;

    for(var i = 0; i < extract.length; i++)
    {
        reee = new Date(extract[i].epochtime*millisecondsInASecond);
        extract[i].isoDate = reee.toISOString();
    }

    return extract;
}

// Converts the extract from the JournalEntry table into something more
// human-readable.
function interpretJournalExtract(extract)
{
    var result = [];
    var row, tsObj, ts;

    for(var i = 0; i < extract.length; i++)
    {
        row = {};
        tsObj = new Date(extract[i].thetimestamp*millisecondsInASecond);
        ts = tsObj.toISOString();
        row.timeStamp = ts;
        row.painScore = extract[i].painscore;
        row.remarks = extract[i].remarks;
        result.push(row);
    }

    return result;
}

// Exports.
module.exports = Scraper;
