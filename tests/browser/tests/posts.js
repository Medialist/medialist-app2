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
          .editFeedbackPost(contact, 'contacted', ' right now')
          .section.activityFeed.assertHasFeedbackPostWith(contact, campaign, {
            message: 'He\'s so hot right now',
            contactStatus: 'CONTACTED'
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
          .editCoveragePost(contact, 'completed', 'update! http://medialist.io')
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
          .section.activityFeed.assertHasFeedbackPostWith(contact, campaign2, {campaignName: campaign2.name})

        done()
      })

      t.perform((done) => {
        t.page.contact()
          .editFeedbackPost(campaign1)
          .section.activityFeed.assertHasFeedbackPostWith(contact, campaign1, {campaignName: campaign1.name})

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
        console.log(contact1)
        t.page.campaign()
          .navigate(campaign)
          .addFeedbackPost(contact1, 'not-interested', 'test')
          .section.activityFeed.assertHasFeedbackPostWith(contact1, campaign, {contactName: contact1.name})

        done()
      })

      t.perform((done) => {
        t.page.campaign()
          .editFeedbackPost(contact2, 'not-interested', '')
          .section.activityFeed.assertHasFeedbackPostWith(contact2, campaign, {contactName: contact2.name})

        done()
      })

      done()
    })
    t.page.main().logout()
    t.end()
  }
}

module.exports = test
