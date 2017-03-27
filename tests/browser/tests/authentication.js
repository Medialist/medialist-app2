'use strict'

const faker = require('faker')

const test = {
  '@tags': ['authentication'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)
  },

  'Should not allow any old email address to be used': function (t) {
    t.page.authenticate()
      .navigate()
      .waitForElementVisible('@emailField')
      .sendKeys('@emailField', faker.internet.email())
      .waitForElementVisible('@sendEmailButton')
      .click('@sendEmailButton')
      .waitForElementVisible('@errorMessage')
      .assert.containsText('@errorMessage', 'Please use a')
      .assert.containsText('@errorMessage', '@test.medialist.io address')

    t.end()
  }
}

module.exports = test
