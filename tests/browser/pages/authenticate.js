const faker = require('faker')

module.exports = {
  url: 'http://localhost:3000/',
  elements: {
    emailField: '#authenticate-email-field',
    errorMessage: '.error-message',
    sendEmailButton: '#authenticate-send-email-button',
    onboardingNameField: '#onboarding-name-field',
    onboardingCompleteButton: '#onboarding-save-button'
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
        .sendKeys('@emailField', user.email)
        .waitForElementVisible('@sendEmailButton')
        .click('@sendEmailButton')
        .waitForElementVisible('@onboardingNameField')
        .sendKeys('@onboardingNameField', user.name)
        .waitForElementVisible('@onboardingCompleteButton')
        .click('@onboardingCompleteButton')

      return user
    }
  }]
}
