/**
 * Helpers for various tasks
 */

// Dependencies
const https = require('https');
const crypto = require('crypto');
const validation = require('./validation');
const config = require('./config');

// Container for all the helpers
const helpers = {};

// SHA256 hash
helpers.hash = str =>
  validation.checkNonEmptyString(str)
    ? crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    : false;

// Parse JSON string into an object without throwing
helpers.parseJsonToObject = function(str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
};

helpers.promisifiedHttpsRequest = (params, data) => new Promise((resolve, reject) => {
  const req = https.request(params, res => {
    // Reject on a bad status
    if (res.statusCode < 200 || res.statusCode >= 300) {
      const err = new Error(`statusCode=${res.statusCode}`);
      err.statusCode = res.statusCode;
      return reject(err);
    }

    // Accumulate data
    let body = [];

    res.on('data', chunk => body.push(chunk));

    res.on('end', () => {
      try {
        body = JSON.parse(Buffer.concat(body).toString());
      } catch (error) {
        reject(error);
      }
      resolve(body);
    });
  });

  // Reject the promise if request throws
  req.on('error', err => reject(err));

  // Write data if provided
  if (data) {
    req.write(data);
  }

  // IMPORTANT
  req.end();
});

// Export the module
module.exports = helpers;