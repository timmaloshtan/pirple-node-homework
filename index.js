/*
 * Primary file for the API
 * 
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

// Declare the app
const app = {};

// Init function
app.init = () => {
  // Start the server
  server.init();

  // Start the workers
  workers.init();

  // Start the CLI
  setTimeout(cli.init.bind(cli), 1000);
};

// Execute
app.init();

// Export the app
module.exports = app;