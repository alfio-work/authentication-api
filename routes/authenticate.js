'use strict';

const crypto = require('crypto');
const router = require('express').Router({ mergeParams: true });
const fs = require('fs');
const jwt = require('jsonwebtoken');

const config = require('./../config');
const db = require('./../lib/db')();

router
  .post('/', (req, res, next) => {
    db('sysUser')
      .select(
        'userId',
        'failedAttemptCount'
      )
      .where({
        userName: req.body.userName
      })
      .first()
      .then((result) => {
        if (!result) {
          req.status = 'user-not-found';
        } else {
          req.status = 'user-found';
          if (result.failedAttemptCount > 3) {
            req.status = 'user-locked';
          }

          req.userId = result.userId;
          req.failedAttemptCount = result.failedAttemptCount;
        }
        next();
      })
      .catch(err => res.fail(err))
  }, (req, res, next) => {
    if (req.status !== 'user-found') {
      return next();
    }

    db('vSysUser as vsu')
      .select(
        'vsu.userId'
      )
      .innerJoin('sysUser as su', db.raw(`su.userId = vsu.userId and now() <= ifnull(vsu.resignDate, now())`))
      .whereNull('su.deletedDate')
      .whereNull('su.disabledDate')
      .where({
        'su.userId': req.userId,
        'su.userPass': crypto.createHash('md5').update(req.body.password).digest('hex')
      })
      .first()
      .then((result) => {
        req.status = 'ok';
        if (!result) {
          req.status = 'invalid-password';
        }
        next();
      })
      .catch(err => res.fail(err))
  }, (req, res, next) => {
    if (req.status === 'user-locked') {
      return res.unauthenticated('This account has been locked, please contact IT Administrator', req.body);
    }

    if (req.status === 'user-not-found') {
      return res.unauthenticated("Invalid user name or password", req.body);
    }

    let data = {}
    if (req.status === 'ok') {
      data = {
        failedAttemptCount: 0,
        lastLoginDate: db.fn.now()
      }
    } else {
      let failedAttemptCount = req.failedAttemptCount || 0;
      data = {
        failedAttemptCount: ++failedAttemptCount,
        failedAttemptPass: req.body.password,
        failedAttemptIpAddress: req.ipAddress
      };

      if (failedAttemptCount > 3) {
        data.lockedDate = db.fn.now();
      }
    }

    db('sysUser')
      .where('userId', req.userId)
      .update(data)
      .then(() => next())
      .catch(err => res.fail(err))
  }, (req, res) => {
    if (req.status === 'invalid-password') {
      return res.unauthenticated("Invalid user name or password", req.body);
    }

    const privateKey = fs.readFileSync('./jwtRSA256-private.pem');

    const data = {
      uid: req.userId
    }

    const token = jwt.sign(data, privateKey, {
      expiresIn: 300, // expires in 5 min,
      issuer: config.JWT_ISSUER,
      audience: req.body.cid,
      algorithm: 'RS256',
      subject: "authToken"
    });

    const refreshToken = jwt.sign(data, privateKey, {
      issuer: config.JWT_ISSUER,
      audience: req.body.cid,
      algorithm: 'RS256',
      subject: "refreshToken"
    });

    res.success({
      token,
      refreshToken
    })
  })


module.exports = router;