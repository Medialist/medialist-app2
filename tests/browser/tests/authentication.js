'use strict'

const faker = require('faker')

const test = {
  '@tags': ['authentication'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)
  },

  'Should not allow any old email address to be used': function (t) {
    t.page.authenticate()
      .ensureNoSession()
      .navigate()
      .waitForElementVisible('@emailField')
      .sendKeys('@emailField', faker.internet.email())
      .waitForElementVisible('@sendEmailButton')
      .click('@sendEmailButton')
      .waitForElementVisible('@errorMessage')
      .assert.containsText('@errorMessage', 'Please use a @test.medialist.io address')

    t.end()
  },

  'Should sign out': function (t) {
    t.page.authenticate()
      .register()

    t.page.main().logout()

    t.page.authenticate()
      .waitForElementVisible('@emailField')
      .waitForElementVisible('@sendEmailButton')

    t.end()
  }
}

module.exports = test
