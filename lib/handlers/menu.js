/**
 * Menu handler
 */

// Dependencies
const _data = require('../data');
const validation = require('../validation');
const tokens = require('./tokens');

// Create top level handler
const menu = async data => {
  const acceptableMethods = ['get'];
  if (acceptableMethods.includes(data.method)) {
    return await _menu[data.method](data);
  } else {
    return { statusCode: 405 };
  }
};

// Create a container for all menu methods
const _menu = {};

// Menu - get
// Required data: none
// Optional data: none
_menu.get = async data => {
  // Get the token from headers
  const token = validation.checkToken(data.headers.token);
  
  const tokenIsValid = await tokens.verifyToken(token);

  if (!tokenIsValid) {
    return {
      statusCode: 403,
      payload: { error: 'Missing required token in header or token is invalid' },
    };
  }

  try {
    const menuData = await _data.getCollection('menu');
    return {
      statusCode: 200,
      payload: menuData,
    };
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not get menu data'},
    };
  }
}

// Export module
module.exports = menu;