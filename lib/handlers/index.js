/**
 * Request handlers
 */

// Dependencies
const users = require('./users');

// Define the handlers
const handlers = {};

// Users handler
handlers.users = users;

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