/**
 * Tokens handler
 */

// Dependencies
const _data = require('../data');
const validation = require('../validation');
const helpers = require('../helpers');

// Create top level handler
const tokens = async data => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.includes(data.method)) {
    return await _tokens[data.method](data);
  } else {
    return { statusCode: 405 };
  }
};

// Create a container for all token methods
const _tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
_tokens.post = async data => {
  const email = validation.checkEmail(data.payload.email);
  const password = validation.checkNonEmptyString(data.payload.password);

  if (!email || !password) {
    return {
      statusCode: 400,
      payload: { error: 'Required field(s) is(are) missing or invalid.' },
    };
  }

  // Pull up user data
  let userData;

  try {
    userData = await _data.read('users', email);
  } catch (error) {
    return {
      statusCode: 400,
      payload: { error: 'Could not find specified user' },
    };
  }

  // Hash sent password and compare it to the stored password
  const hashedPassword = helpers.hash(password);

  if (hashedPassword !== userData.hashedPassword) {
    return {
      statusCode: 401,
      payload: { error: 'Password does not match' },
    };
  }

  //If valid, create a new token with a random name.
  // Set expiration date 1 hour in the future.
  const tokenId = helpers.createRandomStrig(20);

  const expires = Date.now() + 1000 * 3600;

  const tokenObject = {
    email,
    id: tokenId,
    expires,
  };

  // Store the token
  try {
    await _data.create('tokens', tokenId, tokenObject);

    return {
      statusCode: 200,
      payload: tokenObject,
    };
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not create the new token' },
    };
  }
};

// Export module
module.exports = tokens;