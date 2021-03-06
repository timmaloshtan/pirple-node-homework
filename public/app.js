/**
 * Front-end logic for the application
 */

// Container for the frontend application
const app = {};

// Config
app.config = {
  sessionToken: false,
};

// AJAX client for the restful API
app.client = {};

// Interface for making API calls
app.client.request = async ({
  headers = {},
  path = '/',
  method = 'GET',
  queryStringObject = {},
  payload = {},
}) => {

  const queryString = Object.entries(queryStringObject)
    .map(entry => entry.join('='))
    .join('&');

  const requestUrl = `${path}${queryString ? '?' : ''}${queryString}`;

  return new Promise((resolve, reject) => {
    // Form the http request as a JSON type
    const xhr = new XMLHttpRequest();

    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader("Content-Type", 'application/json');

    // Add the rest of the headers
    Object.keys(headers).forEach(key => {
      xhr.setRequestHeader(key, headers[key]);
    });

    // If there is a current session token
    // add that as a header as well
    if (app.config.sessionToken) {
      xhr.setRequestHeader('token', app.config.sessionToken.id);
    }

    // Handle the reponse
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        const { status: statusCode, responseText } = xhr;

        try {
          resolve({
            statusCode,
            payload: JSON.parse(responseText),
          });
        } catch (error) {
          reject(error);
        }
      }
    };

    // Send off the request as JSON
    const payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
  });
};

// Bind the logout button
app.bindLogoutButton = () => {
  document.getElementById('logoutButton').addEventListener('click', e => {
    e.preventDefault();

    app.logUserOut();
  });
};

// Log the user out then redirect to /sessionDeleted
app.logUserOut = async () => {
  // Get current token id
  const { id } = app.config.sessionToken;

  var queryStringObject = { id };

  await app.client.request({
    path: 'api/tokens',
    method: 'DELETE',
    queryStringObject,
  });

  // Clear the token from front
  app.setSessionToken(false);

  // Send the user to the logged out page
  window.location = '/session/deleted';
};

// Bind the forms
app.bindForms = () => {
  const form = document.querySelector('form');

  if (!form) {
    return;
  }

  const allForms = document.querySelectorAll('form');
  Array.from(allForms).forEach(form => {
    form.addEventListener('submit', async function (e) {

      // Prevent default form behavior
      e.preventDefault();
      const formId = this.id;
      const path = this.action;
      let method = this.method.toUpperCase();
      let queryStringObject;

      // Hide the error message (if it's currently shown due to a previous error)
      const error = document.querySelector(`#${formId} .formError`);
      if (error) {
        error.style.display = 'none';
      }

      // Hide the success message
      const success = document.querySelector(`#${formId} .formSuccess`);
      if (success) {
        success.style.display = 'none';
      }

      // Turn the inputs into a payload
      let payload = {};
      Array.from(this.elements).forEach(
        element => {
          const value = element.classList.contains('intval')
            ? parseInt(element.value)
            : element.value;
          
          if (element.type === 'submit') {
            return;
          }

          if (element.type === 'checkbox' && !element.classList.contains('multiselect')) {
            return payload[element.name] = element.checked;
          }

          if (element.name === '_method') {
            return method = value;
          }

          if (element.name === 'httpmethod') {
            return payload.method = value;
          }

          // Create an payload field named "id" if the elements name is actually uid
          if (element.name === 'uid') {
            return payload.id = value;
          }

          if (element.classList.contains('multiselect')) {
            if (!element.checked) {
              return;
            }
            payload[element.name] = payload[element.name] instanceof Array
              ? payload[element.name]
              : [];
            return element.checked && payload[element.name].push(value);
          }

          payload[element.name] = value;
        }
      );

      if (method === 'DELETE') {
        queryStringObject = payload || {};
        payload = undefined;
      }

      // Call the Api
      try {
        const { statusCode, payload: responsePayload } = await app.client.request({
          path,
          method,
          payload,
          queryStringObject,
        });

        if (statusCode === 200) {
          return app.formResponseProcessor(formId, payload, responsePayload);
        }

        // Try to get the error from api
        const { error = 'An error has occured, please try again' } = responsePayload;

        // Set the formError field with the error text
        document.querySelector("#" + formId + " .formError").innerHTML = error;
        // Show (unhide) the form error field on the form
        document.querySelector("#" + formId + " .formError").style.display = 'block';

      } catch (error) {
        console.warn(error);
      }
    });
  });
};

// Form response processor
app.formResponseProcessor = async function (formId, requestPayload, responsePayload) {
  var functionToCall = false;
  if (formId == 'accountCreate') {
    const { email, password } = requestPayload;
    const path = 'api/tokens';
    const method = 'POST';

    try {
      const { statusCode, payload: loginResponse } = await app.client.request({
        path,
        method,
        payload: {
          email,
          password,
        },
      });

      if (statusCode === 200) {
        // Is successfull, set the token and redirect the user
        app.setSessionToken(loginResponse);
        window.location = '/menu';
      }

      // Set the formError field with the error text
      document.querySelector("#" + formId + " .formError").innerHTML = error;
      // Show (unhide) the form error field on the form
      document.querySelector("#" + formId + " .formError").style.display = 'block';
    } catch (error) {
      console.warn(error);
    }
  }

  if (formId === 'sessionCreate') {
    app.setSessionToken(responsePayload);
    window.location = '/menu';
  }

  // If the user just deleted their account, redirect them to the account-delete page
  if(formId == 'accountEdit3'){
    app.logUserOut(false);
    window.location = '/account/deleted';
  }

  // If the user just created a check, redirect to dashboard
  if (formId === 'checksCreate') {
    window.location = '/checks/all';
  }

  // If forms saved successfully and they have success messages, show them
  const formsWithSuccessMessages = ['accountEdit1', 'accountEdit2','checksEdit1', 'menuList', 'checkout'];
  if(formsWithSuccessMessages.includes(formId)){
    document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
  }
};

// Get the session token from local storage
// and set it in the app.config object
app.getSessionToken = () => {
  const tokenString = localStorage.getItem('token');
  if (typeof (tokenString) !== 'string') {
    return;
  }

  try {
    const token = JSON.parse(tokenString);
    app.config.sessionToken = token;

    if (typeof (token) === 'object') {
      return app.setLoggedInClass(true);
    }

    app.setLoggedInClass(false);
  } catch (error) {
    app.config.sessionToken = false;
    app.setLoggedInClass(false);
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = add => {
  var target = document.querySelector("body");

  if (add) {
    return target.classList.add('loggedIn');
  }

  target.classList.remove('loggedIn');
};

// Set the session token in the app.congig object
// and to local storage
app.setSessionToken = token => {
  app.config.sessionToken = token;
  const tokenString = JSON.stringify(token);
  localStorage.setItem('token', tokenString);

  if (typeof (token) === 'object') {
    return app.setLoggedInClass(true);
  }

  app.setLoggedInClass(false);
};

// Load data on the page
app.loadDataOnPage = () => {
  // Get current page from the body class
  const bodyClasses = document.querySelector('body').classList;
  const [primaryClass] = bodyClasses;

  // Logic for account settings page
  if (primaryClass === 'accountEdit') {
    app.loadAccountEditPage();
  }

  // Logic for menu list page
  if (primaryClass === 'menuList') {
    app.loadMenuListPage();
  }

  // Logic for my cart page
  if (primaryClass === 'myCart') {
    app.loadMyCartPage();
  }
};

// Load cart page specifically
app.loadMyCartPage = async () => {
  try {
    const { statusCode: cartStatusCode, payload: cartPayload } = await app.client.request({
      path: 'api/cart',
      method: 'GET',
    });

    if (cartStatusCode !== 200) {
      throw new Error(`Got a ${cartStatusCode} response :(`);
    }

    const { statusCode: menuStatusCode, payload: menuPayload } = await app.client.request({
      path: 'api/menu',
      method: 'GET',
    });

    if (menuStatusCode !== 200) {
      throw new Error(`Got a ${menuStatusCode} response :(`);
    }

    console.log('menuPayload :', menuPayload);
    console.log('cartPayload :', cartPayload);

    const form = document.querySelector('.formWrapper');
    form.innerHTML = '';
    let total = 0;

    menuPayload.filter(item => cartPayload[item._id]).forEach(item => {
      const element = document.createElement('div');
      element.className = "cart__item";

      const itemTotal = cartPayload[item._id] * item.price;

      element.innerHTML = `
        <div class="item__details">
          <span class="item__title">${item.title} X ${cartPayload[item._id]}</span>
          <span class="item__total">$ ${itemTotal}</span>
        </div>
        <div class="item__actions">
          <button class="cta red" id="${item._id}">Remove item</button>
        </div>
      `;

      form.appendChild(element);

      total += itemTotal;
    });

    const element = document.createElement('div');
    element.className = "cart__item";

    element.innerHTML = `
        <div class="item__details">
          <span class="item__title">Total: </span>
          <span class="item__total">$ ${total}</span>
        </div>
        <div class="item__actions">
          <a href="checkout" class="cta green">Go to checkout!</a>
        </div>
      `;

    form.appendChild(element);

    app.bindCartButtons();

  } catch (error) {
    console.warn(error);
  }
};

// Bind buttons on the cart page
app.bindCartButtons = () => {
  const buttons = document.querySelectorAll('button.cta.red');
  
  buttons.forEach(button => {
    button.addEventListener('click', removeClickHandler);
  });

  async function removeClickHandler(event) {
    const queryStringObject = { item: this.id };

    try {
      await app.client.request({
        path: 'api/cart',
        method: 'DELETE',
        queryStringObject,
      });

      window.location = '/cart';
    } catch (error) {
      
    }
  }
}

// Load menu list page speficically
app.loadMenuListPage = async () => {
  try {
    const { statusCode, payload } = await app.client.request({
      path: 'api/menu',
      method: 'GET',
    });

    const select = document.querySelector('#pizzaSelector');

    payload.forEach(pizza => {
      const option = document.createElement('option');
      option.value = pizza._id;
      option.innerText = `${pizza.title} for $${pizza.price}`;

      select.appendChild(option);
    })
  } catch (error) {
    console.warn(error);
  }
};

// Load the account edit page specifically
app.loadAccountEditPage = async () => {
  // Get the email from current token
  // Log out if there is none
  const { email } = app.config.sessionToken;

  if (!email) {
    return app.logUserOut();
  }

  const queryStringObject = { email };

  try {
    const { statusCode, payload } = await app.client.request({
      path: 'api/users',
      method: 'GET',
      queryStringObject
    });

    if (statusCode !== 200) {
      return app.logUserOut();
    }

    // Put the data into the forms as values where needed
    document.querySelector("#accountEdit1 .firstNameInput").value = payload.firstName;
    document.querySelector("#accountEdit1 .lastNameInput").value = payload.lastName;
    document.querySelector("#accountEdit1 .displayEmailInput").value = payload.email;
    document.querySelector("#accountEdit1 .streetInput").value = payload.street;
    document.querySelector("#accountEdit1 .houseInput").value = payload.house;

    // Put the hidden email field into both forms
    const hiddenEmailInputs = document.querySelectorAll("input.hiddenEmailInput");

    Array.from(hiddenEmailInputs).forEach(
      input => input.value = payload.email,
    );
  } catch (error) {
    console.warn(error);
  }
};

// Init (bootstraping)
app.init = () => {

  // Bind all form submissions
  app.bindForms();

  // Bind logout button
  app.bindLogoutButton();

  // Get the token from local storage
  app.getSessionToken();

  // Renew token
  // app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();
};

// Call the init process after the window loads
window.onload = () => {
  app.init();
};
