/**
 * Checkout handler
 */

// Dependencies
const helpers = require('../helpers');

// Create top level handler
const checkout = async data => {
  const acceptableMethods = ['get'];

  if (!acceptableMethods.includes(data.method)) {
    return { statusCode: 405, contentType: 'html' };
  }

  // Prepare data for interpolation
  const templateData = {
    'head.title': 'Checkout',
    'body.class': 'checkout',
  };

  // Read template as a string
  try {
    const contentTemplate = await helpers.getTemplate('checkout', templateData);
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
module.exports = checkout;