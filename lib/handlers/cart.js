/**
 * Shopping cart handler
 */

// Dependencies
const validation = require('../validation');
const _data = require('../data');
const config = require('../config');
const tokens = require('./tokens');


// Create top level handler
const cart = async data => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.includes(data.method)) {
    return await _cart[data.method](data);
  } else {
    return { statusCode: 405 };
  }
};

// Create a container for all cart methods
const _cart = {};

// Cart - post
// Creates an entry in user's cart or replaces existing value
// Required data: itemId
// Optional data: quantity (default is 1)
_cart.post = async data => {
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

  // Validate provided data
  const itemId = validation.checkMenuItem(data.payload.itemId);
  const quantity = validation.checkPositiveInteger(data.payload.quantity) || 1;

  if (!itemId) {
    return {
      statusCode: 400,
      payload: { error: 'Menu item is missing or invalid' },
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

  const userCart = typeof userData.cart === 'object'
    && userData.cart !== null
    ? userData.cart
    : {};

  // Calculate available space in cart
  // Take into account that new entry can replace existing one
  const quantityInCart = Object.values(userCart).reduce((a, b) => a + b, 0);
  const cartSpace = config.maxItems - (quantityInCart - (userCart[itemId] || 0));

  if (cartSpace < quantity) {
    return {
      statusCode: 400,
      payload: { error: `Can not add as many items to the cart. Can only add ${cartSpace} items of this type now` },
    };
  }

  // Make a record of particular item
  const newUserData = {
    ...userData,
    cart: {
      ...userCart,
      [itemId]: quantity,
    },
  };

  // Store updated user data
  try {
    await _data.update('users', email, newUserData);

    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: `Could not update user data` },
    };
  }
};

// Export module
module.exports = cart;