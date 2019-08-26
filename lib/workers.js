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

const chargeOrder = async order => {
  // Construct request data
  const requestData = {
    amount: Math.floor(order.total * 100), // stripe requires amounts in smallest increments (cents for $)
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

  try {
    const charge = await helpers.promisifiedHttpsRequest(requestDetails, stringPayload);

    return charge;
  } catch (error) {
    const err = new Error(`Failed to create a charge on order ${order.id}`);
    err.details = error;
    return err;
  }
};

const updateOrder = async (order, charge) => {
  if (charge instanceof Error) {
    throw charge;
  }

  if (charge.status === 'failed') {
    return;
  }

  const newOrderData = {
    ...order,
    processed: true,
  };

  try {
    await _data.update('orders', order.id, newOrderData);
  } catch (error) {
    const err = new Error(`Could not update data for order ${order.id}`);
    err.details = error;
    throw err;
  }
};

const sendMail = async (email, subject, text) => {
  // Prepare request params
  const params = helpers.buildQuery({
    to: email,
    from: `Owner Tim <tim@${config.mailgun.domain}>`,
    subject,
    text
  });

  // Encode Mailgun api key for basic authorization on server
  const auth = Buffer.from(`api:${config.mailgun.apiKey}`).toString('base64');

  // Construct a request
  const requestDetails = {
    protocol: 'https:',
    hostname: 'api.mailgun.net',
    method: 'POST',
    path: encodeURI(`/v3/${config.mailgun.domain}/messages${params}`),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    },
  };

  return helpers.promisifiedHttpsRequest(requestDetails);
}

const emailCustomer = async (order, charge) => {
  if (charge.status === 'failed') {
    return sendMail(
      order.email,
      'Failed to process your order',
      `We were not able to charge your for the order ${order.id}.
        Please update your payment method.`
    );
  }

  // Compose the receipt
  const subject = `Your receipt for the order ${order.id}`;

  const menu = await _data.getCollection('menu');

  const items = Object.keys(order.positions).map(position => {
    const { title } = menu.find(menuItem => menuItem._id === position);

    return `${order.positions[position]} x ${title}\n`;
  });

  const text = items.reduce(
    (final, part) => final + part,
    'Your order includes:\n'
  ) + `For the total of $${order.total}`

  return sendMail(
    order.email,
    subject,
    text,
  );
};

const processAllOrders = async () => {
  // Get unprocessed orders from db
  let unprocessedOrders;
  try {
    unprocessedOrders = await _data.getCollection('orders', {
      q: { processed: false },
    });
  } catch (error) {
    return debug(error);
  }

  // Process orders
  // Charge
  // Update
  // Send a confirmation to the customer
  unprocessedOrders.forEach(async order => {
    try {
      const charge = await chargeOrder(order);
      await updateOrder(order, charge);
      await emailCustomer(order, charge);
    } catch (error) {
      return debug(error);
    }
  })
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