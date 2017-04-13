'use strict'

const faker = require('faker')
const tmp = require('tmp')
const fs = require('fs')
const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')

const test = {
  '@tags': ['activity'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should display context sensitive posts when adding a contact to a campaign': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const dashboardPage = t.page.dashboard()
          .navigate()

        dashboardPage.section.activityFeed
          .waitForElementVisible('@addContactsToCampaignPost')
          .assert.containsText('@addContactsToCampaignPost', `added ${contact.name} (${contact.outlets[0].label}) to ${campaign.name}`)

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.section.activityFeed
          .waitForElementVisible('@addContactsToCampaignPost')
          .assert.containsText('@addContactsToCampaignPost', `added ${contact.name.split(' ')[0]} to ${campaign.name}`)

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.section.activityFeed
          .waitForElementVisible('@addContactsToCampaignPost')
          .assert.containsText('@addContactsToCampaignPost', `added ${contact.name} (${contact.outlets[0].label})`)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
