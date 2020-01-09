/**
 * Helpers for various tasks
 */

// Dependencies
const https = require('https');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const util = require('util');

const validation = require('./validation');
const config = require('./config');

// Promisify required functions
const promisifiedReadFile = util.promisify(fs.readFile);

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

// Get the string content of a template
helpers.getTemplate = async (templateName, data) => {
  templateName = validation.checkNonEmptyString(templateName);
  data = validation.checkObject(data);

  if (!templateName) {
    throw new Error('Template name was not specified');
  }

  const templatesDir = path.join(__dirname, '/../templates/');

  try {
    const templateString = await promisifiedReadFile(
      `${templatesDir}${templateName}.html`,
      'utf8',
    );

    return helpers.interpolate(templateString, data);
  } catch (error) {
    throw error;
  }
};

// Add the universal header and footer to a string
// and pass the provided data object to header and footer
// for interpolation
helpers.addUniversalTemplates = async (str, data) => {
  str = validation.checkNonEmptyString(str);
  data = validation.checkObject(data);

  try {
    const headerString = await helpers.getTemplate('_header', data);
    const footerString = await helpers.getTemplate('_footer', data);

    return headerString + str + footerString;
  } catch (error) {
    throw error;
  }
};

// Take a given string and a data object and find/replace all the keys within in
helpers.interpolate = (str, data) => {
  str = validation.checkNonEmptyString(str);
  data = validation.checkObject(data);

  // Add the templateGlobals to the data object, prepending their key name with "global"
  Object.keys(config.templateGlobals).forEach(key => data[`global.${key}`] = config.templateGlobals[key])

  // For each key in the data object, insert its value into the string
  // at the corresponding placeholder
  const interpolatedStr = Object.keys(data).reduce(
    (accString, key) => accString.replace(`{${key}}`, data[key]),
    str,
  );

  return interpolatedStr;
};

// Get the contents of the static (public) asset
helpers.getStaticAsset = async fileName => {
  fileName = validation.checkNonEmptyString(fileName);

  if (!fileName) {
    throw new Error('File name is missing or invalid');
  }

  const publicDir = path.join(__dirname, '/../public/');

  // Read file
  try {
    return await promisifiedReadFile(`${publicDir}${fileName}`);
  } catch (error) {
    throw new Error('No file could be found');
  }
};

helpers.isPromise = value => (
  value != null && typeof value.then === 'function'
);

helpers.ensureResolved = value => (
  helpers.isPromise(value) ? value : Promise.resolve(value)
);

helpers.ensureRejected = value => (
  helpers.isPromise(value) ? value : Promise.reject(value)
);

helpers.ensureAsync = fn => (...args) => {
  try {
    return helpers.ensureResolved(fn(...args));
  } catch (err) {
    return helpers.ensureRejected(err);
  }
};

// Export the module
module.exports = helpers;