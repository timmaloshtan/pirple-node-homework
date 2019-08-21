/**
 * Worker-related tasks
 * 
 */

// Dependencies
const util = require('util');
const config = require('./config');
const _data = require('./data');
const debug = util.debuglog('workers');
const helpers = require('./helpers');
const querystring = require("querystring");

// Instantiate the worker object
const workers = {};

const processAllOrders = async () => {
  let unprocessedOrders;
  try {
    unprocessedOrders = await _data.getCollection('orders', {
      q: { processed: false },
    });
  } catch (error) {
     return debug(error);
  }

  const [order] = unprocessedOrders;

  const requestData = {
    amount: 100,
    currency: 'usd',
    source: config.stripe.source,
  };
  
  const stringPayload = querystring.stringify(requestData);

  // Construct a request
  const requestDetails = {
    protocol: 'https:',
    hostname: 'api.stripe.com',
    method: 'POST',
    path: `/v1/charges`,
    auth: config.stripe.apiKey,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "Content-Length": Buffer.byteLength(stringPayload),
    },
  };



  const charge = await helpers.promisifiedHttpsRequest(requestDetails, stringPayload);

  debugger;
};

// Timer to execute the worker process once every 5 min
const loop = () => {
  setInterval(processAllOrders, 1000 * 60 * 5);
}

// Init method
workers.init = () => {
  // Send to console in yellow
  console.log('\x1b[33m%s\x1b[0m', 'Background workers are running.');

  // Execure all the checks immediatelly
  processAllOrders();

  // Call the loop so the checks continue to execute
  loop();
}

// Export the module
module.exports = workers;