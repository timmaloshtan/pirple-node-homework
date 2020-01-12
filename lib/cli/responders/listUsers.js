/**
 * List users responder
 */

const data = require('../../data');
const formating = require('../formating');

const listUsers = async () => {
  try {
    const users = await data.getCollection('users');
    
    users.forEach(user => {
      formating.drawHorizontalLine();
      console.log(`Customer: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Address: ${user.house} ${user.street} st.`);
    });
    formating.drawHorizontalLine();
    formating.printVerticalSpaces();
  } catch (error) {
    console.warn(error);
  }
};

module.exports = listUsers;