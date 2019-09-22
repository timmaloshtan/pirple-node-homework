/**
 * Public handler
 */

// Dependencies
const helpers = require('../helpers');

// Create top level handler
const public = async data => {
  const acceptableMethods = ['get'];

  if (!acceptableMethods.includes(data.method)) {
    return { statusCode: 405, contentType: 'html' };
  }
  
  const assetName = data.trimmedPath.replace('public/', '').trim();

  if (!assetName.length) {
    return { statusCode: 404 };
  }

  // Read in asset data
  let asset;
  try {
    asset = await helpers.getStaticAsset(assetName);
  } catch (error) {
    return { statusCode: 404 };
  }

  // Determine the content type and default to plain text
  const types = {
    css: 'css',
    jpg: 'jpg',
    png: 'png',
    ico: 'favicon',
  };

  const matches = assetName.match(/[^/.]\w+$/i);
  const assetExtension = matches && matches[0];

  return {
    statusCode: 200,
    payload: asset,
    contentType: types[assetExtension] || 'plain',
  };
};

// Export module
module.exports = public;