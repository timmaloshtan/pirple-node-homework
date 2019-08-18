/**
 * Orders handler
 */

// Dependencies
const _data = require('../data');
const validation = require('../validation');
const helpers = require('../helpers');
const tokens = require('./tokens');

// Create top level handler
const orders = async data => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.includes(data.method)) {
    return await _orders[data.method](data);
  } else {
    return { statusCode: 405 };
  }
};

// Create a container for method handlers
const _orders = {};

// Orders - post
// Required data: 
// Optional data:
_orders.post = async data => {
  // Check that the token is valid
  const token = validation.checkToken(data.headers.token);
  // Verify that the given token is valid
  const tokenIsValid = await tokens.verifyToken(token);

  if (!tokenIsValid) {
    return {
      statusCode: 403,
      payload: { error: 'Missing required token in header or token is invalid' },
    };
  }

  // Read token data
  let tokenData;
  try {
    tokenData = await _data.read('tokens', token);
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not read token data' },
    };
  }

  const { email } = tokenData;

  // Read user data
  let userData;
  try {
    userData = await _data.read('users', email);
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not read user data' },
    };
  }

  // Read menu data
  let menu;
  try {
    menu = await _data.getCollection('menu');
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not read menu data' },
    };
  }

  const menuLookup = menu.reduce(
    (lookup, menuItem) => ({
      ...lookup,
      [menuItem._id]: menuItem,
    }),
    {}
  );

  const orderId = helpers.createRandomStrig(20);
  const positions = userData.cart;
  const total = Object.keys(positions).reduce(
    (acc, item) => acc + (positions[item] * menuLookup[item].price),
    0
  );
  const processed = false;

  return {};
};

// Export module
module.exports = orders;