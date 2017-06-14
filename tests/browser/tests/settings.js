'use strict'

const faker = require('faker')

const test = {
  '@tags': ['settings'],

  beforeEach: (t) => {
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
    settingsPage.section.profile.clear('@nameField')
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

    t.page.main().logout()
    t.end()
  },

  'Should add a new campaign list': function (t) {
    const name = faker.hacker.noun()

    const settingsPage = t.page.settings()
      .navigateToCampaignLists()

    settingsPage.section.campaignLists
      .createNewList(name)

    t.page.main().waitForSnackbarMessage('create-campaign-list-success')

    t.perform(function (done) {
      t.db.findCampaignList({
        name: name
      })
      .then(function (doc) {
        t.assert.equal(doc.name, name)

        done()
      })
    })

    t.page.main().logout()
    t.end()
  },

  'Should edit a campaign list': function (t) {
    const newName = faker.hacker.noun()

    t.createDomain(['campaignList'], (campaignList, done) => {
      const settingsPage = t.page.settings()
        .navigateToCampaignLists()

      settingsPage.section.campaignLists
        .updateListName(campaignList, newName)

      t.page.main().waitForSnackbarMessage('update-campaign-list-success')

      t.perform(function (done) {
        t.db.findCampaignList({
          name: newName
        })
        .then(function (doc) {
          t.assert.equal(doc.name, newName)

          done()
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should delete a campaign list': function (t) {
    t.createDomain(['campaignList'], (campaignList, done) => {
      const settingsPage = t.page.settings()
        .navigateToCampaignLists()

      settingsPage.section.campaignLists
        .openDeleteListsModal(campaignList)

      settingsPage.section.deleteListsModal
        .confirm()

      t.page.main().waitForSnackbarMessage('delete-campaign-lists-success')

      settingsPage.section.campaignLists
        .assertNotInList(campaignList)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add a new contact list': function (t) {
    const name = faker.hacker.noun()

    const settingsPage = t.page.settings()
      .navigateToContactLists()

    settingsPage.section.contactLists
      .createNewList(name)

    t.page.main().waitForSnackbarMessage('create-contact-list-success')

    t.perform(function (done) {
      t.db.findContactList({
        name: name
      })
      .then(function (doc) {
        t.assert.equal(doc.name, name)

        done()
      })
    })

    t.page.main().logout()
    t.end()
  },

  'Should edit a contact list': function (t) {
    const newName = faker.hacker.noun()

    t.createDomain(['contactList'], (contactList, done) => {
      const settingsPage = t.page.settings()
        .navigateToContactLists()

      settingsPage.section.contactLists
        .updateListName(contactList, newName)

      t.page.main().waitForSnackbarMessage('update-contact-list-success')

      t.perform(function (done) {
        t.db.findContactList({
          name: newName
        })
        .then(function (doc) {
          t.assert.equal(doc.name, newName)

          done()
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should delete a contact list': function (t) {
    t.createDomain(['contactList'], (contactList, done) => {
      const settingsPage = t.page.settings()
        .navigateToContactLists()

      settingsPage.section.contactLists
        .openDeleteListsModal(contactList)

      settingsPage.section.deleteListsModal
        .confirm()

      t.page.main().waitForSnackbarMessage('delete-contact-lists-success')

      settingsPage.section.contactLists
        .assertNotInList(contactList)

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
