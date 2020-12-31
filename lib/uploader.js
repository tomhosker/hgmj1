/*
This code holds a class which uploads some given data to the database.
*/

// Imports.
const PG = require("pg");

// Local imports.
const Constants = require("./constants.js");
const Finaliser = require("./finaliser.js");

// Local constants.
const constants = new Constants();
const Client = PG.Client;
const millisecondsInASecond = 1000;
const secondsInADay = 24*60*60;

/***************
** MAIN CLASS **
***************/

// The class in question.
class Uploader
{
    constructor()
    {
        this.finaliser = new Finaliser();
    }

    insertNewJournalEntry(req, res, tableName)
    {
        var query = "INSERT INTO "+tableName+" "+
                        "(painScore, theTimeStamp, remarks) "+
                    "VALUES ($1, $2, $3);";
        var params = [];
        var timestamp = Math.floor(Date.now()/millisecondsInASecond);

        params.push(req.body.painScore);
        params.push(timestamp);
        if(req.body.remarks === "") params.push(null);
        else params.push(req.body.remarks);

        this.runQuery(req, res, query, params, tableName);
    }

    insertNewJournalEntrySpecial(req, res, tableName)
    {
        var query = "INSERT INTO "+tableName+" "+
                        "(painScore, theTimeStamp, remarks) "+
                    "VALUES ($1, $2, $3);";
        var params = [];
        var dateObj = new Date(req.body.timeStamp);
        var when = Math.floor(dateObj.getTime()/millisecondsInASecond);

        params.push(req.body.painScore);
        params.push(when);

        if(req.body.remarks === "") params.push(null);
        else params.push(req.body.remarks);

        this.runQuery(req, res, query, params, tableName);
    }

    bulkFillInterval(req, res, tableName)
    {
        var query = "SELECT MAX(theTimeStamp) FROM "+tableName+";";
        var that = this;
        var leftLimit;
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true
        });

        client.connect();
        client.query(query, (err, result) => {
            if(err) throw err;

            leftLimit = result.rows[0]["max"];

            that.bulkFillIntervalPart2(req, res, tableName, leftLimit);
        });
    }

    bulkFillIntervalPart2(req, res, tableName, leftLimit)
    {
        var now = Math.floor(Date.now()/millisecondsInASecond);
        var rightLimit = now-secondsInADay;
        var params = [];
        var query = "INSERT INTO "+tableName+" "+
                        "(painScore, theTimeStamp, remarks) "+
                    "VALUES ";
        var ordinal = 1;
        var addition;
        const insertWidth = 3;

        for(let t = leftLimit+secondsInADay; t < rightLimit-secondsInADay;
            t = t+secondsInADay)
        {
            params.push(constants.bulkFillPainScore);
            params.push(t);
            params.push("Bulk entry @"+now+".");

            if(ordinal !== 1) query = query+", ";

            query = query+makeQueryAddition(ordinal, insertWidth);

            ordinal = ordinal+insertWidth;
        }

console.log(leftLimit);
console.log(params);
console.log(query);

        this.runQuery(req, res, query, params, tableName);
    }

    runQuery(req, res, queryString, params, tableName)
    {
        var that = this;
        var errorFlag = false;
        var properties;
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: true
        });

        client.connect();
        client.query(queryString, params, (err, result) => {
            if(err)
            {
                properties = { title: "Upload Unsuccessful", success: false,
                               error: err };
            }
            else
            {
                properties = { title: "Upload Successful", success: true,
                               data: req.body, table: tableName,
                               error: null };
            }
            client.end();
            that.finaliser.protoRender(req, res, "aftersql", properties);
        });
    }
}

/*********************
** HELPER FUNCTIONS **
*********************/

// Ronseal.
function extractParams(data)
{
    var result = Object.values(data);

    for(var i = 0; i < result.length; i++)
    {
        if(result[i] === "") result[i] = null;
    }

    return result;
}

// Add the "blanks" to a PostgreSQL query where the parameters will go.
function makeQueryAddition(startingOrdinal, insertWidth)
{
    var result = "(";

    for(let i = startingOrdinal; i < startingOrdinal+insertWidth; i++)
    {
        if(i !== startingOrdinal) result = result+", ";

        result = result+"$"+i;
    }
    result = result+")";

    return result;
}

// Exports.
module.exports = Uploader;
