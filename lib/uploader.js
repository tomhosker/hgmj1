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
        let query = "INSERT INTO "+tableName+" "+
                        "(painScore, theTimeStamp, remarks) "+
                    "VALUES ($1, $2, $3);";
        let params = [];
        let timestamp = Math.floor(Date.now()/millisecondsInASecond);

        params.push(req.body.painScore);
        params.push(timestamp);

        if(req.body.remarks === "") params.push(null);
        else params.push(req.body.remarks);

        this.runQuery(req, res, query, params, tableName);
    }

    insertNewJournalEntrySpecial(req, res, tableName)
    {
        let query = "INSERT INTO "+tableName+" "+
                        "(painScore, theTimeStamp, remarks) "+
                    "VALUES ($1, $2, $3);";
        let params = [];
        let dateObj = new Date(req.body.timeStamp);
        let when = Math.floor(dateObj.getTime()/millisecondsInASecond);

        params.push(req.body.painScore);
        params.push(when);

        if(req.body.remarks === "") params.push(null);
        else params.push(req.body.remarks);

        this.runQuery(req, res, query, params, tableName);
    }

    bulkFillInterval(req, res, tableName)
    {
        let query = "SELECT MAX(theTimeStamp) FROM "+tableName+";";
        let that = this;
        let leftLimit;
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
        let now = Math.floor(Date.now()/millisecondsInASecond);
        let rightLimit = now-secondsInADay;
        let params = [];
        let query = "INSERT INTO "+tableName+" "+
                        "(painScore, theTimeStamp, remarks) "+
                    "VALUES ";
        let ordinal = 1;
        let addition;
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

        this.runQuery(req, res, query, params, tableName);
    }

    runQuery(req, res, queryString, params, tableName)
    {
        let that = this;
        let errorFlag = false;
        let properties;
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: { require: true, rejectUnauthorized: false }
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
    let result = Object.values(data);

    for(var i = 0; i < result.length; i++)
    {
        if(result[i] === "") result[i] = null;
    }

    return result;
}

// Add the "blanks" to a PostgreSQL query where the parameters will go.
function makeQueryAddition(startingOrdinal, insertWidth)
{
    let result = "(";

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
