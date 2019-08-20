/**
 * Worker-related tasks
 * 
 */

// Dependencies

// Instantiate the worker object
const workers = {};

// Init method
workers.init = () => {
  // Send to console in yellow
  console.log('\x1b[33m%s\x1b[0m', 'Background workers are running.');

  // Execure all the checks immediatelly
  // processAllOrders();

  // Call the loop so the checks continue to execute
  // loop();
}

// Export the module
module.exports = workers;