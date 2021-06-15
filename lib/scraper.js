/*
This code holds a class which scrapes the required data from a database.
*/

// Imports.
const PG = require("pg");

// Local imports.
const Finaliser = require("./finaliser.js");

// Local constants.
const Client = PG.Client;
const MILLISECONDS_IN_A_SECOND = 1000;
const RECENT_ENTRIES = 7;

// The class in question.
class Scraper
{
    constructor()
    {
        this.finaliser = new Finaliser();
    }

    fetchAsIs(req, res)
    {
        const tableName = req.params.id;

        this.checkTableName(req, res, tableName);
    }

    // Fetch all data from the Journal Entry table.
    fetchJournal(req, res)
    {
        let that = this;
        let extract, data;
        const title = "The Journal";
        const queryString = "SELECT * FROM JournalEntry "+
                            "ORDER BY theTimeStamp;";
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { require: true, rejectUnauthorized: false }
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
        let that = this;
        let extract, data;
        const title = "Recent Journal Entries";
        const queryString =
            "SELECT * FROM "+
                "(SELECT TOP "+RECENT_ENTRIES+" * FROM JournalEntry "+
                " ORDER BY theTimeStamp DESC) "+
            "ORDER BY theTimeStamp ASC;"
console.log(queryString);
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { require: true, rejectUnauthorized: false }
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
        let that = this;
        let extract;
        let tableNames = [];
        const queryString = "SELECT table_schema, table_name "+
                            "FROM information_schema.tables "+
                            "WHERE table_type = 'BASE TABLE';";
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { require: true, rejectUnauthorized: false }
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
        let that = this;
        let extract, data;
        const queryString = "SELECT * FROM "+tableName+";";
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { require: true, rejectUnauthorized: false }
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
    let columns, rows;
    let result = {};

    if(!extract || (extract.length === 0)) return null;

    columns = Object.keys(extract[0]);
    rows = dictToRows(extract);

    result.columns = columns;
    result.rows = rows;

    return result;
}

// Extract the rows from a list of dictionaries.
function dictToRows(list)
{
    let result = [];
    let row = [];

    for(let i = 0; i < list.length; i++)
    {
        row = Object.values(list[i]);
        result.push(row);
    }

    return result;
}

// Checks the validity of a given table name.
function checkTableName(tableName, extract)
{
    let nameToBeChecked;

    for(let i = 0; i < extract.length; i++)
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
    let row;

    for(let i = 0; i < extract.length; i++)
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
    let reee;

    for(let i = 0; i < extract.length; i++)
    {
        reee = new Date(extract[i].epochtime*MILLISECONDS_IN_A_SECOND);
        extract[i].isoDate = reee.toISOString();
    }

    return extract;
}

// Converts the extract from the JournalEntry table into something more
// human-readable.
function interpretJournalExtract(extract)
{
    let result = [];
    let row, tsObj, ts;

    for(var i = 0; i < extract.length; i++)
    {
        row = {};
        tsObj = new Date(extract[i].thetimestamp*MILLISECONDS_IN_A_SECOND);
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
