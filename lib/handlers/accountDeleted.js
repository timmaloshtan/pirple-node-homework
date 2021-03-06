/**
 * Account Deleted handler
 */

// Dependencies
const helpers = require('../helpers');

// Create top level handler
const accountDeleted = async data => {
  const acceptableMethods = ['get'];

  if (!acceptableMethods.includes(data.method)) {
    return { statusCode: 405, contentType: 'html' };
  }

  // Prepare data for interpolation
  const templateData = {
    'head.title': 'Account Deleted',
    'head.description': 'Your account has been deleted',
    'body.class': 'accountDeleted',
  };

  // Read template as a string
  try {
    const contentTemplate = await helpers.getTemplate('accountDeleted', templateData);
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
module.exports = accountDeleted;