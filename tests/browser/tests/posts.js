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
          .editFeedbackPost(contact, 'contacted', ' Hansella!')
          .assert.containsText(`[data-id=post-message]`, 'He\'s so hot right now Hansella!')
          .assert.containsText(`[data-id=contact-status]`, 'CONTACTED')

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
  }
}

module.exports = test
