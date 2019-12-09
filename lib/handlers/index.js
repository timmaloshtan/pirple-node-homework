/**
 * Request handlers
 */

// Dependencies
const users = require('./users');
const tokens = require('./tokens');
const menu = require('./menu');
const cart = require('./cart');
const orders = require('./orders');

const index = require('./home');
const accountCreate = require('./accountCreate');
const accountEdit = require('./accountEdit');
const accountDeleted = require('./accountDeleted');
const sessionCreate = require('./sessionCreate');
const sessionDeleted = require('./sessionDeleted');
const menuList = require('./menuList');

const public = require('./public');
const favicon = require('./favicon');

// Define the handlers
const handlers = {};

/**
 * HTML Handlers
 */

// Index handler
handlers.index = index;

// Create Account handler
handlers.accountCreate = accountCreate;

// Edit Account handler
handlers.accountEdit = accountEdit;

// Account Deleted handler
handlers.accountDeleted = accountDeleted;

// Create Session handler
handlers.sessionCreate = sessionCreate;

// Session Deleted handler
handlers.sessionDeleted = sessionDeleted;

// Menu list handler
handlers.menuList = menuList;

// Public handler
handlers.public = public;

// Favicon handler
handlers.favicon = favicon;

/**
 * JSON API handlers
 */

// Users handler
handlers.users = users;

// Tokens handler
handlers.tokens = tokens;

// Menu handler
handlers.menu = menu;

// Cart handler
handlers.cart = cart;

// Orders handler
handlers.orders = orders;

// Ping handler
handlers.ping = data => ({
  statusCode: 200,
});

// Not found handler
handlers.notFound = data => ({
  statusCode: 404,
});

// Export the module
module.exports = handlers;