'use strict';

const config = require('./../config');

module.exports = function (req, res, next) {

  // if (!req.getApiKey()) {
  //   return res.noApiKey();
  // }

  // if (!req.getApplicationName()) {
  //   return res.invalidApiKey();
  // }

  next();
}