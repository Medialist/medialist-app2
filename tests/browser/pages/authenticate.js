const faker = require('faker')

module.exports = {
  url: 'http://localhost:3000/',
  elements: {
    emailField: '#authenticate-email-field',
    passwordField: '#authenticate-password-field',
    nameField: '#authenticate-name-field',
    signInButton: '#authenticate-sign-in-button',
    registerButton: '#authenticate-register-button'
  },
  commands: [{
    register: function () {
      const user = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.name.findName()
      }

      this
        .navigate()
        .waitForElementVisible('@emailField')
        .sendKeys('@emailField', user.email)
        .waitForElementVisible('@passwordField')
        .sendKeys('@passwordField', user.password)
        .waitForElementVisible('@nameField')
        .sendKeys('@nameField', user.name)
        .waitForElementVisible('@registerButton')
        .click('@registerButton')

      return user
    },
    signIn: function (email, password) {
      this
        .navigate()
        .waitForElementVisible('@emailField')
        .sendKeys('@emailField', email)
        .waitForElementVisible('@passwordField')
        .sendKeys('@passwordField', password)
        .waitForElementVisible('@signInButton')
        .click('@signInButton')
    }
  }]
}
