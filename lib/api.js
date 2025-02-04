'use strict'

const http = require('http');

function get(url, params = {}) {
  return new Promise((resolve, reject) => {

    let paramString = '';
    if (params) {
      paramString = '?' + parseParams(params, reject);
    }

    const req = http
      .get(url + paramString, (res) => httpResponse(res, resolve, reject));

    req.on('error', function (e) {
      return reject(e.code);
    });
  });
}

function post(url, data) {
  const postData = JSON.stringify(data);

  const req = http.request(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  }, (res) => httpResponse(res, resolve, reject));

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

function parseParams(params) {
  return Object.keys(params).map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&')
}

function httpResponse(res, resolve, reject) {
  if (![200, 204].includes(res.statusCode)) {
    console.log('reject res', res.statusCode, res.statusMessage);
    return reject();
  }

  const chunks = [];
  res
    .on('data', function (chunk) {
      chunks.push(chunk);
    })
    .on('end', function () {
      try {
        const buffer = Buffer.concat(chunks);
        const stringData = buffer.toString();
        const jsonData = JSON.parse(stringData);
        const data = jsonData.data;
        return resolve(data);
      } catch (error) {
        console.log('error', error);
        return reject(error);
      }
    })
}

module.exports = {
  get,
  post
}