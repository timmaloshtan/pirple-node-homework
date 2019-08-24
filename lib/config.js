/*
 * Create and export configuration variables
 * 
 */

// Container for all the environments
const environments = {};

const apiKey = 'MY_API_KEY';
const database = 'pirple-node-hw2';

const common = {
  maxItems: 10,
  mLab: {
    database: 'pirple-node-hw2',
    apiKey: 'MY_API_KEY',
  },
  stripe: {
    apiKey: 'MY_API_KEY',
    source: 'tok_mastercard',
  },
}

// Staging (default) environment
environments.staging = {
  ...common,
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsASecret',
};

// Production environment
environments.production = {
  ...common,
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'thisIsAlsoASecret',
};

// Determine which env was passed as a command-line argument
const currentEnvironment = typeof process.env.NODE_ENV == 'string'
  ? process.env.NODE_ENV.toLowerCase()
  : '';

// Check that current env exists in environments container or default to staging
const environmentToExport = typeof environments[currentEnvironment] == 'object'
  ? environments[currentEnvironment]
  : environments.staging;

// Export the module
module.exports = environmentToExport;
