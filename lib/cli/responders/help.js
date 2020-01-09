/**
 * Help responder
 */

const formating = require('../formating');

const help = () => {
  const commands = {
    'exit': 'Kill the CLI (and the rest of the app)',
    'help': 'Show this help page',
    'man': 'Alias of the "help" command',
    'menu': 'List awailable menu items',
    'list orders': 'Show a list of recent orders in the system',
    'more order info --{orderId}': 'Show details of a specific order',
    'list users': 'Show a list of recently registered users',
    'more user info --{userEmail}': 'Show details of a specific user',
  };

  // Show the header for the help page that is as wide as the screen
  formating.drawHorizontalLine();
  formating.printCenteredString('CLI MANUAL');
  formating.drawHorizontalLine();
  formating.printVerticalSpaces(2);

  // Show each command, followed by its explanation
  Object.keys(commands).forEach(command => {
    const description = commands[command];
    const key = `\x1b[33m${command}\x1b[0m`;

    const line = formating.padWithTrailingSpaces(40 - key.length, key) + description;

    console.log(line);
    formating.printVerticalSpaces();
  });

  // End manual
  formating.drawHorizontalLine();
};

module.exports = help;