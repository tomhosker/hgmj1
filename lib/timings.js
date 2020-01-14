/*
This code contains a class which handles time and date.
*/

// Constants.
const gregMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
                    "Sep", "Oct", "Nov", "Dec"];

// The class in question.
class Timings
{
  constructor()
  {
    this.greg = new Date();
    this.gregDay = this.greg.getDate();
    this.gregMonth = this.greg.getMonth();
    this.gregYear = this.greg.getFullYear();
  }

  // Ronseal.
  getNow()
  {
    var result = this.greg.toISOString();
    return result;
  }

  // Get a (Gregorian) date string, formatted just how I like it.
  getMyGreg()
  {
    var result, dayString, monthString, yearString;

    dayString = this.gregDay.toString();
    if(dayString.length === 1) dayString = "0"+dayString;
    monthString = gregMonths[this.gregMonth];
    yearString = this.gregYear.toString();
    result = dayString+" "+monthString+" "+yearString;

    return result;
  }
}

// Exports.
module.exports = Timings;
