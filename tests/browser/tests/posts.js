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
          .addCoveragePost(contact, 'completed', 'https://www.test.com')
          .editCoveragePost('update! http://medialist.io')
          .section.activityFeed.assertHasCoveragePostWith(contact, campaign, {message: 'update!'})

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
  }
}

module.exports = test
