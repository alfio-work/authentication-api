'use strict';

const dotenv = require('dotenv');
dotenv.config();

var express = require('express');
var path = require('path');
const logger = require('morgan');

const response = require('./lib/response');
const authentication = require('./lib/authentication');
const request = require('./lib/request');

const routes = require('./routes/route');
const app = express();
const route = express();

app.use(logger('dev'));

app.set('trust proxy', true);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

route.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: function setHeaders(res, path, stat) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

route.use(response);
route.use(request);
route.use(authentication);
route.use(routes);

app.use('/api', route);

app.disable('x-powered-by');
app.enable('trust proxy');

module.exports = app;
