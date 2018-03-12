'use strict'

const test = {
  '@tags': ['posts'],

  beforeEach: function (t) {
    this.user = t.page.authenticate()
      .register()
  },

  'Should only be able to edit a post you\'ve created': function (t) {
    t.createDomain(['user', 'campaign', 'contact'], (user1, campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        t.page.campaign()
          .navigate(campaign)
          .addFeedbackPost(contact, 'hot-lead', 'He\'s so hot')
          .editFeedbackPost(' right now')
          .section.activityFeed.assertHasFeedbackPostWith(contact, campaign, {
            message: 'He\'s so hot right now',
            contactStatus: 'hot-lead'
          })

        t.page.main().logout()
        done()
      })

      t.perform((done) => {
        t.page.authenticate()
          .register()

        t.page.campaign()
          .navigate(campaign)
          .waitForElementVisible('@openPostMenuButton')
          .click('@openPostMenuButton')
          .assert.elementNotPresent('@editPostButton')
          .click('body')

        t.page.main().logout()
        done()
      })

      done()
    })
    t.end()
  },

  'Should be able to update a coverage post': function (t) {
    t.createDomain(['user', 'campaign', 'contact'], (user1, campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        t.page.campaign()
          .navigate(campaign)
          .addCoveragePost(contact, 'completed', 'Coverage posted in the Daily Telegraph')
          .editCoveragePost('update! Coverage posted in the Daily Telegraph')
          .section.activityFeed.assertHasCoveragePostWith(contact, campaign, {message: 'update!'})

        done()
      })

      done()
    })
    t.page.main().logout()
    t.end()
  },

  'Should be able to add a coverage post even if the URL can not be scraped': function (t) {
    t.createDomain(['user', 'campaign', 'contact'], (user1, campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const url = `https://test${Date.now()}.medialist.io`

      t.perform((done) => {
        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage.section.postBox
          .openCoverageTab()
          .selectContact(contact)
          .selectContactStatus('completed')
          .waitForElementVisible('@coverageInput')
          .setValue('@coverageInput', url)
          .waitForElementVisible('@createPostButton')
          .click('@createPostButton')
          // The post box should now "close"
          .waitForElementNotVisible('@selectContactButton')
          .waitForElementNotVisible('@createPostButton')

        campaignPage.section.activityFeed
          .assertHasCoveragePostWith(contact, campaign, {message: url})

        done()
      })

      done()
    })
    t.page.main().logout()
    t.end()
  },

  'Should be able to update a need-to-know post': function (t) {
    t.createDomain(['user', 'campaign', 'contact'], (user1, campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        t.page.contact()
          .navigate(contact)
          .addNeedToKnowPost(contact, 'Need to knows')
          .editNeedToKnowPost(contact, 'Kneed 2 Nose')
          .section.activityFeed.assertHasNeedToKnowPostWith(contact, campaign, {message: 'Kneed 2 Nose'})

        done()
      })

      done()
    })
    t.page.main().logout()
    t.end()
  },
  'Should be able to change the campaign feedback post on the contacts page': function (t) {
    t.createDomain(['user', 'campaign', 'campaign', 'contact'], (user1, campaign1, campaign2, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign1, () => done())
      })

      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign2, () => done())
      })

      t.perform((done) => {
        t.page.contact()
          .navigate(contact)
          .addFeedbackPost(campaign2, 'hot-lead', 'test')
          .section.activityFeed.assertHasFeedbackPostWith(contact, campaign2, {
            campaignName: campaign2.name,
            message: 'test'
          })

        done()
      })

      t.perform((done) => {
        t.page.contact()
          .editFeedbackPost(' woo woo')
          .section.activityFeed.assertHasFeedbackPostWith(contact, campaign2, {
            campaignName: campaign2.name,
            message: 'test woo woo'
          })

        done()
      })

      done()
    })
    t.page.main().logout()
    t.end()
  },
  'Should be able to change the contact feedback post on the campaign page': function (t) {
    t.createDomain(['user', 'campaign', 'contact', 'contact'], (user1, campaign, contact1, contact2, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      t.perform((done) => {
        t.page.campaign()
          .navigate(campaign)
          .addFeedbackPost(contact1, 'hot-lead', 'test')
          .section.activityFeed.assertHasFeedbackPostWith(contact1, campaign, {
            contactName: contact1.name,
            message: 'test'
          })

        done()
      })

      t.perform((done) => {
        t.page.campaign()
          .section.campaignContacts.assertContactHasStatus(contact1, 'Hot Lead')

        done()
      })

      t.perform((done) => {
        t.page.campaign()
          .editFeedbackPost(' woo woo')
          .section.activityFeed.assertHasFeedbackPostWith(contact1, campaign, {
            contactName: contact1.name,
            message: 'test woo woo'
          })

        done()
      })

      t.perform((done) => {
        t.page.campaign()
          .section.campaignContacts.assertContactHasStatus(contact1, 'Hot Lead')

        done()
      })

      done()
    })
    t.page.main().logout()
    t.end()
  },

  'Should default contact status to last status when posting feedback': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.page.campaign()
        .navigate(campaign)
        .addFeedbackPost(contact, 'hot-lead', 'He\'s so hot')

      // Clear out the previous selections
      t.refresh()

      t.page.campaign()
        .section.postBox
          .openFeedbackTab()
          .selectContact(contact)
          .assert.containsText('@contactStatusSelectorButton', 'HOT LEAD')

      done()
    })
    t.end()
  }
}

module.exports = test
