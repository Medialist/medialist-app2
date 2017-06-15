'use strict'

const test = {
  '@tags': ['posts'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should be able to edit a post you\'ve created': function (t) {
    t.createDomain(['user', 'user', 'campaign', 'contact'], (user1, user2, campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      t.perform((done) => {
        const campaignPage = t.page.campaign()
          .navigate(campaign)

        campaignPage
          .addFeedbackPost(contact, 'hot-lead', 'He\'s so hot right now')
          .editFeedbackPost(contact, 'Contacted', 'Hansella!')
          .assert.containsText(`[data-contact=${contact._id}]`, 'Hansella!')

        done()
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
