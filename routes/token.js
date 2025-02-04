'use strict';

const router = require('express').Router({ mergeParams: true });
const fs = require('fs');
const jwt = require('jsonwebtoken');

const config = require('./../config');
const db = require('./../lib/db')();

router
  .post('/', (req, res, next) => {
    try {
      const publicKey = fs.readFileSync('./jwtRSA256-public.pem');
      const dt = jwt.verify(req.body.token, publicKey, {
        algorithm: 'RS256',
        subject: "authToken",
        issuer: config.JWT_ISSUER,
      });

      req.userId = dt.uid;
      req.audience = dt.aud;

      next();
    }
    catch (err) {
      console.log('req.body', req.body)
      res.invalidToken();
    }
  }, (req, res, next) => {
    db('vSysUser as vsu')
      .select(
        'vsu.userId',
        'su.userCode',
        'vsu.employeeCode',
        'vsu.fullName',
        'vsu.defaultRoute',
        'vsu.siteId'
      )
      .innerJoin('sysUser as su', 'su.userId', 'vsu.userId')
      .where('vsu.userId', req.userId)
      .first()
      .then((result) => {
        if (!result) {
          return res.unauthorized();
        }
        req.userCode = result.userCode;
        req.employeeCode = result.employeeCode;
        req.fullName = result.fullName;
        req.defaultRoute = result.defaultRoute;
        req.siteId = result.siteId;
        next();
      })
      .catch(err => res.fail(err))
  }, (req, res, next) => {
    db('sysMenu as sm')
      .distinct('sm.menuCode')
      .innerJoin('sysRoleMenu as srm', 'srm.menuId', 'sm.menuId')
      .innerJoin('sysUserRole as sur', 'sur.roleId', 'srm.roleId')
      .where({
        'sur.userId': req.userId,
        'sm.siteId': req.siteId
      })
      .then((result) => {
        req.menus = result.map(row => row.menuCode);
        next();
      })
      .catch(err => res.fail(err))
  }, (req, res) => {
    const privateKey = fs.readFileSync('./jwtRSA256-private.pem');

    const data = {
      uid: req.userId,
      ucd: req.userCode,
      emp: req.employeeCode,
      fnm: req.fullName,
      drt: req.defaultRoute,
      mns: req.menus,
      sid: req.siteId
    }

    const token = jwt.sign(data, privateKey, {
      expiresIn: 3600, // expires in 1 hour,
      issuer: config.JWT_ISSUER,
      audience: req.audience,
      algorithm: 'RS256',
      subject: "token"
    });

    const refreshToken = jwt.sign({
      uid: req.userId
    }, privateKey, {
      issuer: config.JWT_ISSUER,
      audience: req.audience,
      algorithm: 'RS256',
      subject: "refreshToken"
    });

    res.success({
      token,
      refreshToken
    });
  })


module.exports = router;