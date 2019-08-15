/**
 * Users handler
 */

// Dependencies
const _data = require('../data');
const validation = require('../validation');
const helpers = require('../helpers');

// Create top level handler
const users = async data => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.includes(data.method)) {
    return await _users[data.method](data);
  } else {
    return { statusCode: 405 };
  }
};

// Create a container for method handlers
const _users = {};

// Users - post
// Required data: firstName, lastName, email, password, street, house
// Optional data: none
_users.post = async data => {
  // Validate required fields
  const firstName = validation.checkNonEmptyString(data.payload.firstName);
  const lastName = validation.checkNonEmptyString(data.payload.lastName);
  const email = validation.checkEmail(data.payload.email);
  const password = validation.checkNonEmptyString(data.payload.password);
  const street = validation.checkNonEmptyString(data.payload.street);
  const house = validation.checkPositiveInteger(data.payload.house);

  // Return 400 if payload is missing required fields
  if (!firstName || !lastName || !email || !password || !street || !house) {
    return {
      statusCode: 400,
      payload: { error: 'Required fields are missing or invalid' },
    };
  }

  // Check if the user with this email already exists
  try {
    await _data.read('users', email);

    return {
      statusCode: 400,
      payload: { error: 'User with this email already exists' },
    };
  } catch (error) {
    console.log(error); 
  }

  // Hash the password
  const hashedPassword = helpers.hash(password);

  if (!hashedPassword) {
    return {
      statusCode: 500,
      payload: { error: 'Could not hash the password'},
    };
  }

  // Create the user object
  const userObject = {
    firstName,
    lastName,
    email,
    hashedPassword,
    street,
    house,
  };

  console.log('userObject :', userObject);

  // Store the user to mongo db
  try {
    await _data.create(
      'users',
      email,
      userObject,
    );

    return { statusCode: 200 };
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not create a new user' },
    };
  }
};

module.exports = users;