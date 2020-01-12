/**
 * More user info responder
 */

const validation = require('../../validation');
const data = require('../../data');
const formating = require('../formating');

const moreUserInfo = async (userInput) => {
  // Get the ID from the user input
  const inputs = userInput.split('--');
  const userId = validation.checkEmail(inputs[1]);

  if (!userId) {
    return console.log('This command requires a valid user email')
  }

  try {
    const user = await data.read('users', userId);

    formating.drawHorizontalLine();
    console.log(`Name: ${user.firstName}     Lastname: ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Address: ${user.house} ${user.street} st.`);
    console.log(`# of orders: ${user.orders ? user.orders.length : 0}`);
    formating.drawHorizontalLine();
    formating.printVerticalSpaces();
  } catch (error) {
    console.warn(error);
  }
};

module.exports = moreUserInfo;