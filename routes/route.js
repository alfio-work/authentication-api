'use strict';

const route = require('express')();

route.use('/authenticate', require('./authenticate'));
route.use('/refresh-token', require('./refresh-token'));
route.use('/token', require('./token'));

module.exports = route;