const faker = require('faker')

module.exports = {
  url: 'http://localhost:3000/',
  elements: {
    emailField: '[data-id=authenticate-email-field]',
    errorMessage: '.error-message',
    sendEmailButton: '[data-id=authenticate-send-email-button]',
    onboardingNameField: '[data-id=onboarding-name-field]',
    onboardingCompleteButton: '[data-id=onboarding-save-button]'
  },
  commands: [{
    register: function () {
      const user = {
        email: faker.internet.email(null, null, 'test.medialist.io'),
        password: faker.internet.password(),
        name: faker.name.findName()
      }

      this
        .navigate()
        .waitForElementVisible('@emailField')
        .setValue('@emailField', user.email)
        .waitForElementVisible('@sendEmailButton')
        .click('@sendEmailButton')
        .waitForElementVisible('@onboardingNameField')
        .clearValue('@onboardingNameField')
        .setValue('@onboardingNameField', user.name)
        .waitForElementVisible('@onboardingCompleteButton')
        .click('@onboardingCompleteButton')

      return user
    }
  }]
}
