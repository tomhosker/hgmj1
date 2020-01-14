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

  // Performs an "insert" query.
  insert(req, res, tableName)
  {
    var query = constructInsertQuery(tableName, req.body);
    var params = extractParams(req.body);
    var that = this;
    var properties;

    this.runQuery(req, res, query, params, tableName);
  }

  // Performs an "update" query.
  update(req, res, tableName)
  {
    var keyHeading = Object.keys(req.body)[0];
    var keyValue = Object.values(req.body)[0];
    var query, params;

    delete req.body[keyHeading];
    delete req.body.update;
    query = constructUpdateQuery(tableName, req.body, keyHeading);
    params = extractParamsForUpdate(req.body, keyValue);

    this.runQuery(req, res, query, params, tableName);
  }

  // Performs an "insert" query on a given log.
  appendToLog(req, res, tableName, idKey, idValue, redirect)
  {
    var date = new Date();
    var timeStamp = Math.floor(date.getTime()/millisecondsInASecond);
    var remarks = req.body.remarks;
    var queryString = "INSERT INTO "+tableName+" "+
                        "("+idKey+", epochTime, remarks) "+
                      "VALUES ($1, $2, $3);";
    var params = [idValue, timeStamp, remarks];
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
        errorFlag = true;
        properties = { title: "Upload Unsuccessful", success: false,
                       error: err };
      }
      client.end();

      if(errorFlag)
      {
        that.finaliser.protoRender(req, res, "aftersql", properties);
        return;
      }

      res.redirect(redirect);
    });
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
function constructInsertQuery(tableName, data)
{
  var result = "INSERT INTO "+tableName+" (";
  var n = Object.keys(data).length;
  var qs = "";
  var placeHolder, placeHolderNo;

  for(var i = 0; i < n; i++)
  {
    placeHolderNo = i+1;
    placeHolder = "$"+placeHolderNo;

    if(i === n-1)
    {
      result = result+Object.keys(data)[i];
      qs = qs+placeHolder;
    }
    else
    {
      result = result+Object.keys(data)[i]+", ";
      qs = qs+placeHolder+", ";
    }
  }
  result = result+") VALUES ("+qs+");";

  return result;
}

// Ronseal.
function constructUpdateQuery(tableName, data, masterKey)
{
  var result = "UPDATE "+tableName+" SET ";
  var oldKeys = Object.keys(data);
  var keys = [];
  var values = Object.values(data);
  var placeHolder;
  var placeHolderNo = 0;

  // Purge blank fields.
  for(var i = 0; i < values.length; i++)
  {
    if(values[i] === null || values[i] === "") continue;
    else keys.push(oldKeys[i]);
  }

  for(var i = 0; i < keys.length; i++)
  {
    placeHolderNo = i+1;
    placeHolder = "$"+placeHolderNo;
    result = result+keys[i]+" = "+placeHolder;
    if(i === keys.length-1) result = result+" ";
    else result = result+", ";
  }

  placeHolderNo = placeHolderNo+1;
  placeHolder = "$"+placeHolderNo;
  result = result+"WHERE "+masterKey+" = "+placeHolder+";";

  return result;
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

// Like the previous function, but for an "UPDATE" query.
function extractParamsForUpdate(data, keyValue)
{
  var candidates = Object.values(data);
  var result = [];

  for(var i = 0; i < candidates.length; i++)
  {
    if((candidates[i] === null) || candidates[i] === "") continue;
    else result.push(candidates[i]);
  }
  result.push(keyValue);

  return result;
}

// Exports.
module.exports = Uploader;
