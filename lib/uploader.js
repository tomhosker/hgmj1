/*
This code holds a class which uploads some given data to a database.
*/

// Imports.
const PG = require("pg");

// Local imports.
const Finaliser = require("./finaliser.js");

// Local constants.
const Client = PG.Client;
const millisecondsInASecond = 1000;

// The class in question.
class Uploader
{
  constructor()
  {
    this.finaliser = new Finaliser();
  }

  insertNewJournalEntry(req, res, tableName)
  {
    var query = "INSERT INTO JournalEntry "+
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
    var query = "INSERT INTO JournalEntry "+
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

  // Run the query.
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
                       data: req.body, table: tableName, error: null };
      }
      client.end();
      that.finaliser.protoRender(req, res, "aftersql", properties);
    });
  }
}

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

// Exports.
module.exports = Uploader;
