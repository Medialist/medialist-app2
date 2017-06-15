'use strict'

const test = {
  '@tags': ['posts'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
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
          .addFeedbackPost(contact, 'hot-lead', 'He\'s so hot right now')
          .editFeedbackPost(contact, 'contacted', ' that Hansella!')
          .assert.containsText(`[data-contact=${contact._id}]`, 'He\'s so hot right now that Hansella!')
          .assert.containsText(`[data-contact=${contact._id}]`, 'CONTACTED')

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
          .assert.containsText(`[data-id=coverage-post][data-contact=${contact._id}]`, 'update!')
          .assert.containsText(`[data-id=coverage-post][data-contact=${contact._id}]`, 'http://medialist.io')

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
          .assert.containsText(`[data-id=need-to-know-post][data-contact=${contact._id}]`, 'Kneed 2 Nose')
          .assert.containsText('[data-id=need-to-knows-list]', 'Kneed 2 Nose')

        done()
      })

      done()
    })
    t.page.main().logout()
    t.end()
  }
}

module.exports = test
