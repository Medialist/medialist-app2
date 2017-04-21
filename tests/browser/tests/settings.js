'use strict'

const faker = require('faker')

const test = {
  '@tags': ['settings'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)

    t.user = t.page.authenticate()
      .register()
  },

  'Can update profile settings': function (t) {
    const newName = faker.name.findName()
    const settingsPage = t.page.settings()

    settingsPage.navigate()
      .waitForElementVisible('@profileSettingsButton')
      .click('@profileSettingsButton')

    settingsPage.section.profile.waitForElementVisible('@nameField')
    settingsPage.section.profile.assert.attributeEquals('@emailField', 'disabled', 'true')
    settingsPage.section.profile.clearValue('@nameField')
    settingsPage.section.profile.setValue('@nameField', newName)
    settingsPage.section.profile.waitForElementVisible('@updateProfileButton')
    settingsPage.section.profile.click('@updateProfileButton')

    t.page.main().waitForSnackbarMessage('profile-update-success')

    t.perform(function (done) {
      t.db.findUser({
        emails: [{
          address: t.user.email,
          verified: true
        }]
      })
      .then(function (doc) {
        t.assert.equal(doc.profile.name, newName)

        done()
      })
    })

    t.end()
  }
}

module.exports = test
