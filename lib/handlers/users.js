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

// Users - get
// Required data: email
// Optional data: none
// @TODO: add token validation
_users.get = async data => {
  // Check provided email number
  const email = validation.checkEmail(data.queryString.email);

  if (!email) {
    return {
      statusCode: 400,
      payload: { error: 'Missing required "email" field' },
    };
  }

  try {
    const userData = await _data.read(
      'users',
      email,
    );

    // Strip the hashed password from user data
    delete userData.hashedPassword;

    return {
      statusCode: 200,
      payload: userData,
    };
  } catch (error) {
    return {
      statusCode: 404,
      payload: { error: 'User does not exist' },
    };
  }
};

// Users - put
// Required data: email
// Optional data: firstName, lastName, password, street, house
// @TODO: add token validation
_users.put = async data => {
  // Check that the provided fields are valid
  const email = validation.checkEmail(data.payload.email);
  const firstName = validation.checkNonEmptyString(data.payload.firstName);
  const lastName = validation.checkNonEmptyString(data.payload.lastName);
  const password = validation.checkNonEmptyString(data.payload.password);
  const street = validation.checkNonEmptyString(data.payload.street);
  const house = validation.checkPositiveInteger(data.payload.house);

  // Check the required field
  if (!email) {
    return {
      statusCode: 400,
      payload: { error: 'Missing required "email" field' },
    };
  }

  // Error if nothing's been sent for update
  if (!firstName && !lastName && !password && !street && !house) {
    return {
      statusCode: 400,
      payload: { error: 'Nothing to update' },
    };
  }

  // Lookup the user
  let userData;

  try {
    userData = await _data.read('users', email);
  } catch (error) {
    return {
      statusCode: 400,
      payload: { error: 'User does not exist' },
    };
  }

  // Update necessary fields
  if (firstName) {
    userData.firstName = firstName;
  }
  if (lastName) {
    userData.lastName = lastName;
  }
  if (password) {
    userData.hashedPassword = helpers.hash(password);
  }
  if (street) {
    userData.street = street;
  }
  if (house) {
    userData.house = house;
  }

  // Store the updates
  try {
    await _data.update('users', email, userData);

    return { statusCode: 200 };
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not update the user' },
    };
  }
};

// Users - delete
// Required data: email
// Optional data: none
// @TODO: add token validation
_users.delete = async data => {
  // Check provided email number
  const email = validation.checkEmail(data.queryString.email);

  if (!email) {
    return {
      statusCode: 400,
      payload: { error: 'Missing required "email" field' },
    };
  }

  // Check that the user exists
  let userData;
  try {
    userData = await _data.read('users', email);
  } catch (error) {
    return {
      statusCode: 404,
      payload: { error: 'User does not exist' },
    };
  }


  // Delete user data
  try {
    await _data.delete('users', email);

    return { statusCode: 200 };
  } catch (error) {
    return {
      statusCode: 500,
      payload: { error: 'Could not delete the user' },
    };
  }
}

module.exports = users;