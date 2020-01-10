/**
 * More order info responder
 */

const validation = require('../../validation');
const data = require('../../data');
const formating = require('../formating');

const moreOrderInfo = async (userInput) => {
  // Get the ID from the user input
  const inputs = userInput.split('--');
  const orderId = validation.checkId(inputs[1]);

  if (!orderId) {
    return console.log('This command requires a valid order ID')
  }

  try {
    const order = await data.read('orders', orderId);

    formating.drawHorizontalLine();
    console.log('Id: ', order.id);
    console.log('Total: ', `$${order.total}`);
    console.log('Customer: ', order.email);
    console.log('Processed: ', order.processed);
    formating.drawHorizontalLine();
    formating.printVerticalSpaces();
  } catch (error) {
    console.warn(error);
  }
};

module.exports = moreOrderInfo;