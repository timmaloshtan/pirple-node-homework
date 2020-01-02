/**
 * Menu List handler
 */

// Dependencies
const helpers = require('../helpers');

// Create top level handler
const myCart = async data => {
  const acceptableMethods = ['get'];

  if (!acceptableMethods.includes(data.method)) {
    return { statusCode: 405, contentType: 'html' };
  }

  // Prepare data for interpolation
  const templateData = {
    'head.title': 'My Cart',
    'body.class': 'myCart',
  };

  // Read template as a string
  try {
    const contentTemplate = await helpers.getTemplate('myCart', templateData);
    const finalTemplate = await helpers.addUniversalTemplates(contentTemplate, templateData);

    return {
      statusCode: 200,
      payload: finalTemplate,
      contentType: 'html',
    };
  } catch (error) {
    return {
      statusCode: 500,
      contentType: 'html',
    };
  }
};

// Export module
module.exports = myCart;