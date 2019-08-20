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
// Required data: none
// Optional data: none
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

  // Construct an order object
  const orderData = {
    id: orderId,
    positions,
    total,
    email,
    processed,
  };

  // Get user orders
  const userOrders = typeof userData.orders === 'object'
    && userData.orders instanceof Array
    ? userData.orders
    : [];

  // Construct new user data
  // and clear the cart
  const newUserData = {
    ...userData,
    orders: [
      ...userOrders,
      orderId,
    ],
    cart: {},
  };

  // Store new user data
  try {
    await _data.update('users', email, newUserData);
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not update user data' },
    };
  }

  // Store order data
  try {
    await _data.create('orders', orderId, orderData);

    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not write order data to db' },
    };
  }
};

// Orders get
// Required data: id,
// Optional data: none
_orders.get = async data => {
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

  // Validate required data
  const id = validation.checkId(data.queryString.id);

  if (!id) {
    return {
      statusCode: 400,
      payload: { error: 'Missing required order id' },
    };
  }

  // Read order data from db
  let orderData;
  try {
    orderData = await _data.read('orders', id);
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not read order data' },
    };
  }

  // Check if requested order belongs to the user
  if (tokenData.email !== orderData.email) {
    return {
      statusCode: 403,
      payload: { error: 'Requested order does not belong to current user' },
    };
  }

  return {
    statusCode: 200,
    payload: orderData,
  };
}

// Orders - delete
// Required data: id
// Optional data: none
_orders.delete = async data => {
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

  // Validate required data
  const id = validation.checkId(data.queryString.id);

  if (!id) {
    return {
      statusCode: 400,
      payload: { error: 'Missing required order id' },
    };
  }

  // Read user data from db
  let userData;
  try {
    userData = await _data.read('users', tokenData.email);
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not read user data' },
    };
  }

  // Get user orders
  const userOrders = typeof userData.orders === 'object'
    && userData.orders instanceof Array
    ? userData.orders
    : [];

  // Check if requested order belongs to the user
  if (!userOrders || !userOrders.includes(id)) {
    return {
      statusCode: 403,
      payload: { error: 'Requested order does not belong to current user' },
    };
  }

  // Read order data
  let orderData;
  try {
    orderData = await _data.read('orders', id);
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not read order data' },
    };
  }

  if (orderData.processed) {
    return {
      statusCode: 400,
      payload: { error: 'Order already processed and can not be canceled' },
    };
  }

  // Delete and order
  try {
    await _data.delete('orders', id);
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not delete an order' },
    };
  }

  const newUserData = {
    ...userData,
    orders: userOrders.filter(orderId => orderId !== id),
  };

  // Store new user data
  try {
    await _data.update('users', userData.email, newUserData);

    return {
      statusCode: 200,
    };
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not store new user data' },
    };
  }
};

// Export module
module.exports = orders;