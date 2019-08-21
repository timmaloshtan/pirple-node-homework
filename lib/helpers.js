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

// Create a string of random alphanumeric characters of a given length
helpers.createRandomStrig = function(len) {
  len = typeof len === 'number' && len > 0
    ? len
    : false;

  if (len) {
    // Define all possible characters
    let possibleCharacters = '';
    for (i = 48; i <= 57; i++) {
      possibleCharacters = possibleCharacters.concat(String.fromCharCode(i));
    }
    for (i = 65; i <= 90; i++) {
      possibleCharacters = possibleCharacters.concat(String.fromCharCode(i));
    }
    for (i = 97; i <= 122; i++) {
      possibleCharacters = possibleCharacters.concat(String.fromCharCode(i));
    }

    // Start the final string
    let str = '';

    for (i = 0; i < len; i++) {
      // Get a random character from the possible characters
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      )
      // Append this character to the final string
      str += randomCharacter;
    }

    // Return a final string
    return str;
  } else {
    return false;
  }
};

helpers.objectToString = function func(obj) {
  const keyValues = Object.entries(obj).reduce(
    (acc, [key, value], i, arr) => `${acc}"${key}":${
      typeof value === 'object' && value !== null
        ? func(value)
        : value
    }${
      i === arr.length - 1 ? '' : ','
    }`,
    '',
  )

  return `{${keyValues}}`;
};

// Query builder
helpers.buildQuery = (query = {}) => {
  const getParams = Object.keys(query);

  if (getParams.length === 0) {
    return '';
  }

  const queryString = getParams.reduce(
    (acc, parameter, index, arr) => {
      const value = typeof query[parameter] === 'object' && query[parameter] !== null
        ? helpers.objectToString(query[parameter])
        : query[parameter];

      return `${acc}${index > 0 ? '&' : ''}${parameter}=${value}`;
    },
    '?',
  );

  return queryString;
};

// Export the module
module.exports = helpers;