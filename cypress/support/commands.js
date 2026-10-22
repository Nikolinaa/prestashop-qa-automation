// command to clear the registration form fields
Cypress.Commands.add('clearRegistrationForm', () => {
  cy.get('#customer-form').within(() => {
    cy.get('#field-firstname').clear();
    cy.get('#field-lastname').clear();
    cy.get('#field-email').clear();
    cy.get('#field-password').clear();
    cy.get('#field-psgdpr').uncheck({ force: true });
    cy.get('#field-customer_privacy').uncheck({ force: true });
  });
});

// command to fill the registration form with provided data
// @param {Object} formData - Object containing the registration data
// @param {Object} options - Optional parameters for checkboxes and submission
// @param {boolean} options.checkGdpr - Whether to check the GDPR checkbox (default: true)
// @param {boolean} options.checkPrivacy - Whether to check the Privacy checkbox (default: true)
// @param {boolean} options.submit - Whether to submit the form after filling (default: true)
// @param {string} options.gender - Gender value to select (default: '2' for female)
Cypress.Commands.add('fillRegistrationForm', (formData = {}, options = {}) => {
  const { 
    checkGdpr = true, 
    checkPrivacy = true, 
    submit = true, 
    gender = '2' 
  } = options;

  cy.clearRegistrationForm();

  if (gender) {
    cy.get(`input[name="id_gender"][value="${gender}"]`).check();
  }

  if (formData.firstName) {
    cy.get('#field-firstname').type(formData.firstName);
  }
  if (formData.lastName) {
    cy.get('#field-lastname').type(formData.lastName);
  }
  if (formData.email) {
    cy.get('#field-email').type(formData.email);
  }
  if (formData.password) {
    cy.get('#field-password').type(formData.password);
  }

  if (checkGdpr) {
    cy.get('#field-psgdpr').check();
  }
  if (checkPrivacy) {
    cy.get('#field-customer_privacy').check();
  }

  if (submit) {
    cy.get('button[data-link-action="save-customer"]')
      .should('be.visible')
      .click();
  }
});
