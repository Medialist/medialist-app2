'use strict'

const faker = require('faker')

const test = {
  '@tags': ['activity'],

  beforeEach: function (t) {
    this.user = t.page.authenticate()
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
          .assertHasAddContactToCampaignPostWith(contact, campaign, {
            summary: 'added',
            campaignName: campaign.name,
            contactName: contact.name,
            contactOutlet: contact.outlets[0].label
          })

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.section.activityFeed
          .assertHasAddContactToCampaignPostWith(contact, campaign, {
            summary: 'added',
            campaignName: campaign.name,
            contactName: contact.name.split(' ')[0]
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.section.activityFeed
          .assertHasAddContactToCampaignPostWith(contact, campaign, {
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

  'Should display context sensitive posts when adding multiple contacts to a campaign': function (t) {
    t.createDomain(['campaign', 'contact', 'contact'], (campaign, contact1, contact2, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      t.perform((done) => {
        const contact1Page = t.page.contact()
          .navigate(contact1)

        contact1Page.section.activityFeed
          .assertHasAddContactToCampaignPostWith(contact1, campaign, {
            summary: 'added',
            campaignName: campaign.name,
            contactName: contact1.name.split(' ')[0]
          })

        const contact2Page = t.page.contact()
          .navigate(contact2)

        contact2Page.section.activityFeed
          .assertHasAddContactToCampaignPostWith(contact2, campaign, {
            summary: 'added',
            campaignName: campaign.name,
            contactName: contact2.name.split(' ')[0]
          })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should prevent multiple postings of the same activity': function (t) {
    t.createDomain(['contactList', 'campaign'], (contactList, campaign, done) => {
      const contactsPage = t.page.contacts()
        .navigate()
        .waitForElementVisible('@newContactButton')

      t.perform(function (done) {
        contactsPage.section.contactTable
          .selectRow(0)
          .selectRow(1)
          .selectRow(2)

        contactsPage.section.toast
          .openAddContactsToCampaignModal()
          .waitForElementVisible(`[data-slug=campaign-slug-${campaign.slug}]`)
          .click(`[data-slug=campaign-slug-${campaign.slug}]`)

        t.page.main().waitForSnackbarMessage('batch-add-contacts-to-campaign-success')

        contactsPage.section.toast
          .openAddContactsToCampaignModal()
          .waitForElementVisible(`[data-slug=campaign-slug-${campaign.slug}]`)
          .click(`[data-slug=campaign-slug-${campaign.slug}]`)

        done()
      })

      t.perform(function (done) {
        const campaignPage = t.page.campaign()
          .navigate(campaign)
          .waitForElementVisible('[data-id=add-contacts-to-campaign-button]')

        campaignPage.section.activityFeed
          .assertNoDuplicatePosts(campaign)

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
          .assertHasFeedbackPostWith(contact, campaign, {
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
          .assertHasFeedbackPostWith(contact, campaign, {
            summary: 'logged feedback',
            campaignName: campaign.name,
            contactStatus: contactStatus,
            message: status
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.waitForElementVisible(campaignPage.section.activityFeed.selector)

        campaignPage.section.activityFeed
        .assertHasFeedbackPostWith(contact, campaign, {
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
          .assertHasCoveragePostWith(contact, campaign, {
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
          .assertHasCoveragePostWith(contact, campaign, {
            summary: 'logged coverage',
            campaignName: campaign.name,
            contactStatus: contactStatus,
            message: status
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.waitForElementVisible(campaignPage.section.activityFeed.selector)

        campaignPage.section.activityFeed
        .assertHasCoveragePostWith(contact, campaign, {
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
          .assertHasNeedToKnowPostWith(contact, {
            summary: 'shared a need-to-know',
            contactName: contact.name,
            contactOutlet: contact.outlets[0].label,
            message: status
          })

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.waitForElementVisible(contactPage.section.activityFeed.selector)

        contactPage.section.activityFeed
          .assertHasNeedToKnowPostWith(contact, {
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

  'Should display context sensitive feedback posts created on campaign page': function (t) {
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
          .assertHasFeedbackPostWith(contact, campaign, {
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
          .assertHasFeedbackPostWith(contact, campaign, {
            summary: 'logged feedback',
            campaignName: campaign.name,
            contactStatus: contactStatus,
            message: status
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.waitForElementVisible(campaignPage.section.activityFeed.selector)

        campaignPage.section.activityFeed
        .assertHasFeedbackPostWith(contact, campaign, {
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

  'Should display context sensitive coverage posts created on campaign page': function (t) {
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
          .assertHasCoveragePostWith(contact, campaign, {
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
          .assertHasCoveragePostWith(contact, campaign, {
            summary: 'logged coverage',
            campaignName: campaign.name,
            contactStatus: contactStatus,
            message: status
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.waitForElementVisible(campaignPage.section.activityFeed.selector)

        campaignPage.section.activityFeed
        .assertHasCoveragePostWith(contact, campaign, {
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

  'Should display embeds in feedback posts': function (t) {
    if (process.env.CI) {
      console.warn('Not running test - see https://github.com/Medialist/medialist-app2/issues/372')

      t.page.main().logout()
      t.end()

      return
    }

    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const url = 'http://www.theguardian.com/technology/2017/apr/19/horizon-zero-dawn-why-best-modern-video-games-are-not-about-saving-the-world'
      const status = `${faker.hacker.phrase()} ${url} ${faker.hacker.phrase()}`
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
          .assertHasFeedbackPostWith(contact, campaign, {
            embed: url
          })

        const contactPage = t.page.contact()
          .navigate(contact)

        contactPage.waitForElementVisible(contactPage.section.activityFeed.selector)

        contactPage.section.activityFeed
          .assertHasFeedbackPostWith(contact, campaign, {
            embed: url
          })

        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.waitForElementVisible(campaignPage.section.activityFeed.selector)

        campaignPage.section.activityFeed
        .assertHasFeedbackPostWith(contact, campaign, {
          embed: url
        })

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should delete a post from the campaign page': function (t) {
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

        campaignPage.section.activityFeed
          .assertHasCoveragePostsForContact(contact)

        campaignPage.section.activityFeed
          .deleteCoveragePostWith(contact, campaign)

        campaignPage.section.activityFeed
          .assertHasNoCoveragePostsForContact(contact)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should delete a post from the contact page': function (t) {
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

        contactPage.section.activityFeed
          .assertHasCoveragePostsForCampaign(campaign)

        contactPage.section.activityFeed
          .deleteCoveragePostWith(contact, campaign)

        contactPage.section.activityFeed
          .assertHasNoCoveragePostsForCampaign(campaign)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should delete a post from the dashboard page': function (t) {
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

        const dashboardPage = t.page.dashboard()
          .navigate()

        dashboardPage.waitForElementVisible(dashboardPage.section.activityFeed.selector)

        dashboardPage.section.activityFeed
          .assertHasCoveragePostsForContact(contact)

        dashboardPage.section.activityFeed
          .deleteCoveragePostWith(contact, campaign)

        dashboardPage.section.activityFeed
          .assertHasNoCoveragePostsForContact(contact)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should cancel deleting a post from the campaign page': function (t) {
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

        campaignPage.section.activityFeed
          .assertHasCoveragePostsForContact(contact)

        campaignPage.section.activityFeed
          .cancelDeleteCoveragePostWith(contact, campaign)

        campaignPage.section.activityFeed
          .assertHasCoveragePostsForContact(contact)

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
