const faker = require('faker')

module.exports = {
  url: 'http://localhost:3000/',
  elements: {
    emailField: '#authenticate-email-field',
    sendEmailButton: '#authenticate-send-email-button'
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

      return user
    }
  }]
}
