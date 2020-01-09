/**
 * CLI-related tasks
 */

// Dependencies
const Cli = require('./Cli');
const exit = require('./responders/exit');
const help = require('./responders/help');

const respondersLookup = {
  exit,
  man: help,
  help,
};



// Export the module
module.exports = new Cli(respondersLookup);