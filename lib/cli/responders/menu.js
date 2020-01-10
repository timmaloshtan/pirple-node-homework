/**
 * Menu responder
 */

const data = require('../../data');
const formating = require('../formating');

const menu = async () => {
  try {
    const menuItems = await data.getCollection('menu');
    
    formating.drawHorizontalLine();
    menuItems.forEach(menuItem => {
      const { title, price } = menuItem;
      console.log(`${formating.padWithTrailingSpaces(30 - title.length, title)}| $${price}`);
    });
    formating.drawHorizontalLine();
    formating.printVerticalSpaces();
  } catch (error) {
    console.warn(error);
  }
};

module.exports = menu;