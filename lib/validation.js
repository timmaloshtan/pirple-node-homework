/**
 * Validation service
 */

// Dependencies

// Define a container for validation methods
const validation = {};

// Validate non-empty string
validation.checkNonEmptyString = str =>
  typeof str === 'string' && str.trim().length > 0
    ? str.trim()
    : false;

// Validate email
validation.checkEmail = email => {
  const emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i

  return typeof email === 'string' && emailRegex.test(email.trim())
    ? email.trim()
    : false;
};

// Validate numver
validation.checkPositiveInteger = number =>
  typeof number === 'number' && number > 0 && number % 1 === 0
    ? number
    : false;

// Validate access token
validation.checkToken = token =>
  typeof token === 'string' && token.trim().length === 20
    ? token
    : false;

// Validate boolean value
validation.checkBoolean = bool =>
  typeof bool == 'boolean' && bool;

validation.checkId = id =>
  typeof id === 'string' && id.trim().length === 20
    ? id
    : false;

validation.checkMenuItem = itemId =>
  ['aa', 'ab', 'ac', 'ad', 'ae'].includes(itemId)
    ? itemId
    : false;

module.exports = validation;