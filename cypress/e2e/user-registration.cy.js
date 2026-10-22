import userData from "../fixtures/userData.json";

describe("User Registration Flow", () => {
  let shopOrigin = "";
  let registrationUrl = "";
  const user = userData.user;
  const invalidEmail = userData.invalidEmail;

  before(() => {
    // Retrieve the shop URL from the iframe
    cy.visit("/");
    cy.get("#framelive")
      .should("be.visible")
      .and("have.attr", "src")
      .and("include", "demo.prestashop.com")
      .then((iframeUrl) => {
        const url = new URL(iframeUrl);
        shopOrigin = url.origin;
        registrationUrl = `${shopOrigin}/en/registration`;
      });
  });

  beforeEach(() => {
    // Open the registration page before each test
    cy.visit(registrationUrl);
  });

  describe("Positive Scenarios", () => {
    it("should successfully register a user with valid data", () => {
      cy.origin(shopOrigin, { args: { user } }, ({ user }) => {
        Cypress.require("../support/commands");
        // Fill in the registration form with valid data and submit
        cy.fillRegistrationForm(user);
        cy.get("#_desktop_ps_customersignin").should(
          "contain.text",
          user.fullName,
        );
      });
    });
  });

  describe("Negative Scenarios", () => {
    it("should prevent registration when required fields are empty", () => {
      cy.origin(shopOrigin, () => {
        Cypress.require("../support/commands");
        // Attempt to submit the form without filling in required fields
        cy.get('button[data-link-action="save-customer"]').click();
        // Verify that the required fields are marked as invalid
        cy.get("#field-firstname")
          .should("have.prop", "validity")
          .its("valueMissing")
          .should("be.true");

        cy.get("#field-email")
          .should("have.prop", "validity")
          .its("valueMissing")
          .should("be.true");

        cy.get("#field-firstname:invalid").should("exist");
      });
    });

    it("should reject an email address with an invalid format", () => {
      const invalidData = { ...user, email: invalidEmail };
      cy.origin(shopOrigin, { args: { invalidData } }, ({ invalidData }) => {
        Cypress.require("../support/commands");
        cy.fillRegistrationForm(invalidData);
        // Verify that the email field is marked as invalid
        cy.get("#field-email")
          .should("have.prop", "validity")
          .its("typeMismatch")
          .should("be.true");

        cy.get("#field-email:invalid").should("exist");
      });
    });

    it("Should reject invalid characters in name fields and display format instructions", () => {
      const invalidNameData = {
        ...user,
        firstName: "Nikolina123",
        lastName: "Tester!",
      };

      cy.origin(
        shopOrigin,
        { args: { invalidNameData } },
        ({ invalidNameData }) => {
          Cypress.require("../support/commands");
          cy.fillRegistrationForm(invalidNameData);
          // Verify that the name fields are marked as invalid
          cy.get(".help-block, .alert-danger")
            .should("be.visible")
            .and("contain.text", "Invalid format.");

          // Verify that the first name and last name fields are marked as invalid
          cy.url().should("include", "registration");
          cy.get("#_desktop_ps_customersignin a").should(
            "contain.text",
            "Sign in",
          );
        },
      );
    });

    it("should prevent registration when GDPR consent is missing", () => {
      cy.origin(shopOrigin, { args: { user } }, ({ user }) => {
        Cypress.require("../support/commands");
        cy.fillRegistrationForm(user, { checkGdpr: false, checkPrivacy: true });
        // Verify that the GDPR checkbox is not checked and the user remains on the registration page
        cy.get("#field-psgdpr").should("not.be.checked");
        cy.url().should("include", "registration");
      });
    });

    it("should reject registration with an already registered email address", () => {
      cy.origin(shopOrigin, { args: { user } }, ({ user }) => {
        Cypress.require("../support/commands");
        // Fill in the form with an already registered email address
        cy.fillRegistrationForm(user);
        // Verify that an error message is displayed
        cy.get(".alert-danger, .help-block")
          .should("be.visible")
          .and(
            "contain.text",
            "The email is already used, please choose another one or sign in",
          );
      });
    });
  });
});
