module.exports = (function Util() {
  return {
    getDate: getDate,
    getDayName: getDayName,
    getMonthName: getMonthName,
    getLongDate: getLongDate,
    getTime: getTime,
    getLongDateTime: getLongDateTime,
    getTimeStamp: getTimeStamp,
    getDateTime: getDateTime,
    uniqid: uniqid
  }

})();

function getDate(date) {
  var d = new Date();
  if (date) {
    d = new Date(date);
  }
  var curr_date = d.getDate();
  var curr_month = d.getMonth() + 1; //Months are zero based
  var curr_year = d.getFullYear();
  curr_month = curr_month.length == 1 ? "0" + curr_month : curr_month;
  return curr_date + "-" + curr_month + "-" + curr_year;
}

function getDayName(i) {
  let days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]
  return days[i];
}

function getMonthName(i) {
  let months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  return months[i - 1];
}

function getLongDate(date) {
  var d = new Date();

  if (date) {
    d = new Date(date);
  }

  var currDay = d.getDay();
  var currDate = d.getDate();
  var currMonth = d.getMonth() + 1; //Months are zero based
  var currYear = d.getFullYear();
  return getDayName(currDay) + ', ' + currDate + ' ' + getMonthName(currMonth) + ' ' + currYear;
}

function getTime(date) {
  var d = new Date();

  if (date) {
    d = new Date(date);
  }

  var curr_hour = d.getHours();
  var curr_minutes = d.getMinutes();
  var curr_second = d.getSeconds();

  curr_hour = curr_hour.toString().length == 1 ? "0" + curr_hour : curr_hour;
  curr_minutes = curr_minutes.toString().length == 1 ? "0" + curr_minutes : curr_minutes;
  curr_second = curr_second.toString().length == 1 ? "0" + curr_second : curr_second;

  return curr_hour + ":" + curr_minutes + ":" + curr_second;
};

function getLongDateTime(date) {
  var d = new Date();

  if (date) {
    d = new Date(date);
  }

  // Date
  var currDate = d.getDate();
  var currMonth = d.getMonth() + 1; //Months are zero based
  var currYear = d.getFullYear();

  //Time
  var currHour = d.getHours();
  var currMinutes = d.getMinutes();
  var currSecond = d.getSeconds();

  currHour = currHour.toString().length == 1 ? "0" + currHour : currHour;
  currMinutes = currMinutes.toString().length == 1 ? "0" + currMinutes : currMinutes;
  currSecond = currSecond.toString().length == 1 ? "0" + currSecond : currSecond;

  return currDate + ' ' +
    getMonthName(currMonth) + ' ' +
    currYear + ' ' +
    currHour + ':' +
    currMinutes + ':' +
    currSecond;
}

function getTimeStamp() {
  var d = new Date();

  //d.setDate(d.getDate() + 20);

  var currDate = ('0' + d.getDate()).slice(-2);
  var currMonth = ('0' + (d.getMonth() + 1)).slice(-2);
  var currYear = d.getFullYear();
  var currHour = d.getHours();
  var currMinutes = d.getMinutes();
  var currSecond = d.getSeconds();

  return currYear + "" + currMonth + "" + currDate + "" + currHour + "" + currMinutes + "" + currSecond;
}

function getDateTime() {
  var d = new Date();
  var curr_date = d.getDate();
  var curr_month = d.getMonth() + 1; //Months are zero based
  var curr_year = d.getFullYear();
  var curr_hour = d.getHours();
  var curr_minutes = d.getMinutes();
  var curr_second = d.getSeconds();

  curr_date = curr_date.toString().length == 1 ? "0" + curr_date : curr_date;
  curr_month = curr_month.toString().length == 1 ? "0" + curr_month : curr_month;
  curr_hour = curr_hour.toString().length == 1 ? "0" + curr_hour : curr_hour;
  curr_minutes = curr_minutes.toString().length == 1 ? "0" + curr_minutes : curr_minutes;
  curr_second = curr_second.toString().length == 1 ? "0" + curr_second : curr_second;

  return curr_date + "-" + curr_month + "-" + curr_year + " " + curr_hour + ":" + curr_minutes + ":" + curr_second;
}

function uniqid(prefix, more_entropy) {

  //  discuss at: http://phpjs.org/functions/uniqid/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //  revised by: Kankrelune (http://www.webfaktory.info/)
  //        note: Uses an internal counter (in php_js global) to avoid collision
  //        test: skip
  //   example 1: uniqid();
  //   returns 1: 'a30285b160c14'
  //   example 2: uniqid('foo');
  //   returns 2: 'fooa30285b1cd361'
  //   example 3: uniqid('bar', true);
  //   returns 3: 'bara20285b23dfd1.31879087'

  if (typeof prefix === 'undefined') {
    prefix = '';
  }

  var retId;
  var formatSeed = function (seed, reqWidth) {
    seed = parseInt(seed, 10)
      .toString(16); // to hex str
    if (reqWidth < seed.length) { // so long we split
      return seed.slice(seed.length - reqWidth);
    }
    if (reqWidth > seed.length) { // so short we pad
      return Array(1 + (reqWidth - seed.length))
        .join('0') + seed;
    }
    return seed;
  };

  // BEGIN REDUNDANT
  if (!this.php_js) {
    this.php_js = {};
  }
  // END REDUNDANT
  if (!this.php_js.uniqidSeed) { // init seed with big random int
    this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
  }
  this.php_js.uniqidSeed++;

  retId = prefix; // start with prefix, add current milliseconds hex string
  retId += formatSeed(parseInt(new Date()
    .getTime() / 1000, 10), 8);
  retId += formatSeed(this.php_js.uniqidSeed, 5); // add seed hex string
  if (more_entropy) {
    // for more entropy we add a float lower to 10
    retId += (Math.random() * 10)
      .toFixed(8)
      .toString();
  }

  return retId;
}