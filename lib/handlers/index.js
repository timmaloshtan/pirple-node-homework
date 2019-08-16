/**
 * Request handlers
 */

// Dependencies
const users = require('./users');
const tokens = require('./tokens');
const menu = require('./menu');

// Define the handlers
const handlers = {};

// Users handler
handlers.users = users;

// Tokens handler
handlers.tokens = tokens;

// Menu handler
handlers.menu = menu;

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