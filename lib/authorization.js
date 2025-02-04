'use strict';

function isAuth(secret, subject) {
  return function (req, res, next) {
    if (!req.getToken()) {
      return res.noToken();
    }

    if (!req.verifyToken(secret, subject)) {
      return res.invalidToken();
    }

    return next();
  }
}

function hasFn(fn) {
  return function (req, res, next) {
    if (!req.hasFn(fn)) {
      return res.unauthorized('Insufficient access right');
    }

    next();
  }
}

function hasMn(mn) {
  return function (req, res, next) {
    if (!req.hasMn(mn)) {
      return res.unauthorized('Insufficient access right');
    }

    next();
  }
}

module.exports = {
  isAuth: isAuth,
  hasMn: hasMn,
  hasFn: hasFn
}