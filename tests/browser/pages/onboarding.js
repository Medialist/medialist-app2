'use strict'

const faker = require('faker')

module.exports = {
  url: 'http://localhost:3000/',
  elements: {
    nameField: '[data-id=onboarding-name-field]',
    completeButton: '[data-id=onboarding-save-button]'
  },
  commands: [{
    onboard: function (name) {
      name = name || faker.name.findName()

      this
        .waitForElementVisible('@nameField')
        .clearValue('@nameField')
        .setValue('@nameField', name)
        .waitForElementVisible('@completeButton')
        .click('@completeButton')

      return this
    }
  }]
}
