'use strict'

module.exports = (req, res, next) => {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept, Api-Key, Connection, Cache-Control, Content-Disposition, Content-Transfer-Encoding");
  res.header("X-Frame-Options", "DENY");

  // SKIP OPTIONS METHOD (Fix CORS error on preflight OPTIONS)
  if (req.method === "OPTIONS") {
    res.end();
    return;
  }

  res.success = function (data) {
    response.call(this, 200, 'OK', data);
  };

  res.fail = function (err, additionalData = {}) {
    console.log('fail', err);
    response.call(this, 400, 'Bad Request', err, additionalData)
  };

  res.noData = function () {
    response.call(this, 204, 'No Data', "No data");
  };

  res.noApiKey = function () {
    response.call(this, 401, 'API Key not found');
  };

  res.invalidApiKey = function () {
    response.call(this, 401, 'Invalid API Key');
  };

  res.noToken = function () {
    response.call(this, 401, 'Token not found');
  };

  res.unauthenticated = function (message, data) {
    data.message = message;
    response.call(this, 401, 'Unauthenticated', message);
  };

  res.unauthorized = function (message) {
    response.call(this, 403, 'Unauthorized', message);
  };

  res.invalidToken = function () {
    response.call(this, 498, 'Invalid Token');
  };

  res.incomplete = function (message) {
    response.call(this, 422, 'Unprocessable Entity', message);
  }

  res.err = function (statusCode, statusText, additionalData = {}) {
    response.call(this, statusCode, statusText, additionalData);
  };

  next();
}

function response(statusCode = 200, statusText = '', data = {}, additionalData = {}) {

  let dataType = typeof data;
  if (dataType === 'object') {
    if (Array.isArray(data)) {
      dataType = 'array';
    }
  }

  let responseData = {
    meta: {
      timestamp: Date.now(),
      copyright: "Copyright 2021 PT. Paramount Enterprise International"
    },
    dataType: dataType,
    data: data
  };

  if (additionalData) {
    Object.assign({
      additionalData: additionalData
    }, responseData)
  }

  if (statusText) {
    this.statusMessage = statusText;
  }

  this.status(statusCode).json(responseData);
}

