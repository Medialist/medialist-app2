'use strict'

const faker = require('faker')

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
          .assertHasAddContactToCampaignPostWithText(contact, campaign, {
            summary: 'added',
            campaignName: campaign.name,
            contactName: contact.name,
            contactOutlet: contact.outlets[0].label
          })

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.section.activityFeed
          .assertHasAddContactToCampaignPostWithText(contact, campaign, {
            summary: 'added',
            campaignName: campaign.name,
            contactName: contact.name.split(' ')[0]
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.section.activityFeed
          .assertHasAddContactToCampaignPostWithText(contact, campaign, {
            summary: 'added',
            contactName: contact.name,
            contactOutlet: contact.outlets[0].label
          })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should display context sensitive feedback posts created on contact page': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const status = faker.hacker.phrase()
      const contactStatus = faker.helpers.randomize(['completed', 'hot-lead', 'contacted', 'to-contact', 'not-interested'])

      t.perform((done) => {
        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.section.postBox
          .postFeedback(campaign, contact, contactStatus, status)

        done()
      })

      t.perform((done) => {
        const dashboardPage = t.page.dashboard()
          .navigate()

        dashboardPage.waitForElementVisible(dashboardPage.section.activityFeed.selector)

        dashboardPage.section.activityFeed
          .assertHasFeedbackPostWithText(contact, campaign, {
            summary: 'logged feedback',
            campaignName: campaign.name,
            contactName: contact.name,
            contactOutlet: contact.outlets[0].label,
            contactStatus: contactStatus,
            message: status
          })

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.waitForElementVisible(contactPage.section.activityFeed.selector)

        contactPage.section.activityFeed
          .assertHasFeedbackPostWithText(contact, campaign, {
            summary: 'logged feedback',
            campaignName: campaign.name,
            contactStatus: contactStatus,
            message: status
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.waitForElementVisible(campaignPage.section.activityFeed.selector)

        campaignPage.section.activityFeed
        .assertHasFeedbackPostWithText(contact, campaign, {
          summary: 'logged feedback',
          contactName: contact.name,
          contactOutlet: contact.outlets[0].label,
          contactStatus: contactStatus,
          message: status
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should display context sensitive coverage posts created on contact page': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const status = faker.hacker.phrase()
      const contactStatus = faker.helpers.randomize(['completed', 'hot-lead', 'contacted', 'to-contact', 'not-interested'])

      t.perform((done) => {
        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.section.postBox
          .postCoverage(campaign, contact, contactStatus, status)

        done()
      })

      t.perform((done) => {
        const dashboardPage = t.page.dashboard()
          .navigate()

        dashboardPage.waitForElementVisible(dashboardPage.section.activityFeed.selector)

        dashboardPage.section.activityFeed
          .assertHasCoveragePostWithText(contact, campaign, {
            summary: 'logged coverage',
            campaignName: campaign.name,
            contactName: contact.name,
            contactOutlet: contact.outlets[0].label,
            contactStatus: contactStatus,
            message: status
          })

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.waitForElementVisible(contactPage.section.activityFeed.selector)

        contactPage.section.activityFeed
          .assertHasCoveragePostWithText(contact, campaign, {
            summary: 'logged coverage',
            campaignName: campaign.name,
            contactStatus: contactStatus,
            message: status
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.waitForElementVisible(campaignPage.section.activityFeed.selector)

        campaignPage.section.activityFeed
        .assertHasCoveragePostWithText(contact, campaign, {
          summary: 'logged coverage',
          contactName: contact.name,
          contactOutlet: contact.outlets[0].label,
          contactStatus: contactStatus,
          message: status
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should display context sensitive need to know posts created on contact page': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const status = faker.hacker.phrase()

      t.perform((done) => {
        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.section.postBox
          .postNeedToKnow(contact, status)

        done()
      })

      t.perform((done) => {
        const dashboardPage = t.page.dashboard()
          .navigate()

        dashboardPage.waitForElementVisible(dashboardPage.section.activityFeed.selector)

        dashboardPage.section.activityFeed
          .assertHasNeedToKnowPostWithText(contact, {
            summary: 'shared a need-to-know',
            contactName: contact.name,
            contactOutlet: contact.outlets[0].label,
            message: status
          })

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.waitForElementVisible(contactPage.section.activityFeed.selector)

        contactPage.section.activityFeed
          .assertHasNeedToKnowPostWithText(contact, {
            summary: 'shared a need-to-know',
            message: status
          })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should display context sensitive feedback posts created on campagin page': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const status = faker.hacker.phrase()
      const contactStatus = faker.helpers.randomize(['completed', 'hot-lead', 'contacted', 'to-contact', 'not-interested'])

      t.perform((done) => {
        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.section.postBox
          .postFeedback(contact, contactStatus, status)

        done()
      })

      t.perform((done) => {
        const dashboardPage = t.page.dashboard()
          .navigate()

        dashboardPage.waitForElementVisible(dashboardPage.section.activityFeed.selector)

        dashboardPage.section.activityFeed
          .assertHasFeedbackPostWithText(contact, campaign, {
            summary: 'logged feedback',
            campaignName: campaign.name,
            contactName: contact.name,
            contactOutlet: contact.outlets[0].label,
            contactStatus: contactStatus,
            message: status
          })

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.waitForElementVisible(contactPage.section.activityFeed.selector)

        contactPage.section.activityFeed
          .assertHasFeedbackPostWithText(contact, campaign, {
            summary: 'logged feedback',
            campaignName: campaign.name,
            contactStatus: contactStatus,
            message: status
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.waitForElementVisible(campaignPage.section.activityFeed.selector)

        campaignPage.section.activityFeed
        .assertHasFeedbackPostWithText(contact, campaign, {
          summary: 'logged feedback',
          contactName: contact.name,
          contactOutlet: contact.outlets[0].label,
          contactStatus: contactStatus,
          message: status
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should display context sensitive coverage posts created on campagin page': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const status = faker.hacker.phrase()
      const contactStatus = faker.helpers.randomize(['completed', 'hot-lead', 'contacted', 'to-contact', 'not-interested'])

      t.perform((done) => {
        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.section.postBox
          .postCoverage(contact, contactStatus, status)

        done()
      })

      t.perform((done) => {
        const dashboardPage = t.page.dashboard()
          .navigate()

        dashboardPage.waitForElementVisible(dashboardPage.section.activityFeed.selector)

        dashboardPage.section.activityFeed
          .assertHasCoveragePostWithText(contact, campaign, {
            summary: 'logged coverage',
            campaignName: campaign.name,
            contactName: contact.name,
            contactOutlet: contact.outlets[0].label,
            contactStatus: contactStatus,
            message: status
          })

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.waitForElementVisible(contactPage.section.activityFeed.selector)

        contactPage.section.activityFeed
          .assertHasCoveragePostWithText(contact, campaign, {
            summary: 'logged coverage',
            campaignName: campaign.name,
            contactStatus: contactStatus,
            message: status
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.waitForElementVisible(campaignPage.section.activityFeed.selector)

        campaignPage.section.activityFeed
        .assertHasCoveragePostWithText(contact, campaign, {
          summary: 'logged coverage',
          contactName: contact.name,
          contactOutlet: contact.outlets[0].label,
          contactStatus: contactStatus,
          message: status
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
