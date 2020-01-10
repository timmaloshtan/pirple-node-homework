/**
 * List orders responder
 */

const data = require('../../data');
const formating = require('../formating');

const listOrders = async () => {
  try {
    const orders = await data.getCollection('orders');
    
    formating.drawHorizontalLine();
    orders.forEach(order => {
      const { id, total } = order;
      const totalString = total.toString();
      const [integerPart, decimalPart = '00'] = totalString.split('.');
      const cents = formating.padWithTrailingZeroes(2 - decimalPart.length, decimalPart)
      console.log(`${id} for the total of $${integerPart}.${cents}`);
    });
    formating.drawHorizontalLine();
    formating.printVerticalSpaces();
  } catch (error) {
    console.warn(error);
  }
};

module.exports = listOrders;