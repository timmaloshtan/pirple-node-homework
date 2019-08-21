/**
 * Library writing, reading and editing mLab database
 */

// Dependencies
const helpers = require('./helpers');
const config = require('./config');

// Container for the module
const lib = {};

const { database, apiKey } = config.mLab;

// Base params for database request
const defaultRequrestParams = {
  protocol: 'https:',
  hostname: 'api.mlab.com',
  headers: {
    'Content-Type': 'application/json',
  },
}

// Create a document inside of a collection
lib.create = async (collection, id, data) => {
  let stringPayload;
  try {
    stringPayload = JSON.stringify({
      ...data,
      _id: id,
    });
  } catch (error) {
    const err = new Error("Please provide data in JSON format");
    err.details = error;
    throw err;
  }

  // Construct a request
  const requestDetails = {
    protocol: 'https:',
    hostname: 'api.mlab.com',
    method: 'POST',
    path: `/api/1/databases/${database}/collections/${collection}?apiKey=${apiKey}`,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(stringPayload),
    },
  };

  try {
    return await helpers.promisifiedHttpsRequest(
      requestDetails,
      stringPayload,
    );
  } catch (error) {
    const err = new Error('Error inserting a document into database');
    err.details = error;
    throw err;
  }
};

// Read a document from a collection
lib.read = async (collection, id) => {
  // Construct a request
  const requestDetails = {
    protocol: 'https:',
    hostname: 'api.mlab.com',
    method: 'GET',
    path: `/api/1/databases/${database}/collections/${collection}/${id}?apiKey=${apiKey}`,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    return await helpers.promisifiedHttpsRequest(requestDetails);
  } catch (error) {
    const err = new Error('Error reading a document from a specified colleciton.');
    err.details = error;
    throw err;
  }
}

// Update a document inside a colleciton
lib.update = async (collection, id, data) => {
  let stringPayload;
  const safeData = {
    ...data,
  };
  delete safeData._id;
  try {
    stringPayload = JSON.stringify( { "$set" : data } );
  } catch (error) {
    const err = new Error("Please provide data in JSON format");
    err.details = error;
    throw err;
  }

  // Construct a request
  const requestDetails = {
    protocol: 'https:',
    hostname: 'api.mlab.com',
    method: 'PUT',
    path: `/api/1/databases/${database}/collections/${collection}/${id}?apiKey=${apiKey}`,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    return await helpers.promisifiedHttpsRequest(
      requestDetails,
      stringPayload,
    );
  } catch (error) {
    const err = new Error('Error updating a document in a specified colleciton.');
    err.details = error;
    throw err;
  }
};

// Remove a document from a collection
lib.delete = async (collection, id) => {
  // Construct a request
  const requestDetails = {
    protocol: 'https:',
    hostname: 'api.mlab.com',
    method: 'DELETE',
    path: `/api/1/databases/${database}/collections/${collection}/${id}?apiKey=${apiKey}`,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    return await helpers.promisifiedHttpsRequest(requestDetails);
  } catch (error) {
    const err = new Error('Error deleting a document from a specified colleciton.');
    err.details = error;
    throw err;
  }
};

// Get collection from db
lib.getCollection = async (collection, query) => {
  const queryString = helpers.buildQuery({
    ...query,
    apiKey,
  });
  // Construct a request
  const requestDetails = {
    protocol: 'https:',
    hostname: 'api.mlab.com',
    method: 'GET',
    path: `/api/1/databases/${database}/collections/${collection}${queryString}`,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    return await helpers.promisifiedHttpsRequest(requestDetails);
  } catch (error) {
    const err = new Error('Could not retrieve a specified collection');
    err.details = error;
    throw err;
  }
}

// Export the module
module.exports = lib;