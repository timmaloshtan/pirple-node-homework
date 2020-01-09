/**
 * CLI-related tasks
 */

// Dependencies
const Cli = require('./Cli');
// const {
//   help,
//   exit,
//   stats,
//   listUsers,
//   moreUserInfo,
//   listChecks,
//   moreCheckInfo,
//   listLogs,
//   moreLogInfo,
// } = require('./responders');

const respondersLookup = {
  man: async userInput => {
    console.log('hello CLI world');
    console.log('Your input is ', userInput);
  }
};



// Export the module
module.exports = new Cli(respondersLookup);