/**
 * Favicon handler
 */

// Dependencies
const helpers = require('../helpers');

// Create top level handler
const favicon = async data => {
  const acceptableMethods = ['get'];

  if (!acceptableMethods.includes(data.method)) {
    return { statusCode: 405, contentType: 'html' };
  }

  // Read in the favicon's data
  try {
    const data = await helpers.getStaticAsset('favicon.ico');

    return {
      statusCode: 200,
      payload: data,
      contentType: 'favicon',
    };
  } catch (error) {
    return {
      statusCode: 500,
    };
  }
};

// Export module
module.exports = favicon;