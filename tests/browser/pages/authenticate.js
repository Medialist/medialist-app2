const faker = require('faker')

module.exports = {
  url: function () {
    return this.api.launchUrl
  },
  elements: {
    emailField: '[data-id=authenticate-email-field]',
    invalidDomainErrorMessage: '[data-id=error-message-invalid-domain]',
    sendEmailButton: '[data-id=authenticate-send-email-button]',
    onboardingNameField: '[data-id=onboarding-name-field]',
    onboardingCompleteButton: '[data-id=onboarding-save-button]'
  },
  commands: [{
    ensureNoSession: function () {
      this
        .navigate()

      this.api.executeAsync(function (done) {
        if (Object.keys(window.localStorage).length) {
          setTimeout(() => {
            window.localStorage.clear()
            done()
          }, 500)
        } else {
          done()
        }
      }, [])

      return this
    },
    register: function () {
      const user = {
        email: faker.internet.email(null, null, 'test.medialist.io'),
        password: faker.internet.password(),
        name: faker.name.findName()
      }

      this
        .ensureNoSession()
        .navigate()
        .waitForElementVisible('@emailField')
        .setValue('@emailField', user.email)
        .waitForElementVisible('@sendEmailButton')
        .click('@sendEmailButton')
        .waitForElementVisible('@onboardingNameField')
        .clear('@onboardingNameField')
        .setValue('@onboardingNameField', user.name)
        .waitForElementVisible('@onboardingCompleteButton')
        .click('@onboardingCompleteButton')

      return user
    }
  }]
}
