/**
 * CLI-related tasks
 */

// Dependencies
const Cli = require('./Cli');
const exit = require('./responders/exit');
const help = require('./responders/help');
const menu = require('./responders/menu');

const respondersLookup = {
  exit,
  man: help,
  help,
  menu,
};



// Export the module
module.exports = new Cli(respondersLookup);