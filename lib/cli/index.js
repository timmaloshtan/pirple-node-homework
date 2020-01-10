/**
 * CLI-related tasks
 */

// Dependencies
const Cli = require('./Cli');
const exit = require('./responders/exit');
const help = require('./responders/help');
const menu = require('./responders/menu');
const listOrders = require('./responders/listOrders');
const moreOrderInfo = require('./responders/moreOrderInfo');

const respondersLookup = {
  exit,
  man: help,
  help,
  menu,
  'list orders': listOrders,
  'more order info': moreOrderInfo,
};



// Export the module
module.exports = new Cli(respondersLookup);