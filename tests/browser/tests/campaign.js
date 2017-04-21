'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')

const test = {
  '@tags': ['campaign'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should edit an existing campaign': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)
        .editCampaign()

      const updated = domain.campaign()

      campaignPage.section.editCampaignForm
        .verifyEditFormContents(campaign)
        .populate(updated)
        .submit()

      t.perform((done) => {
        t.db.findCampaign({
          name: updated.name
        })
        .then((doc) => {
          assertions.campaignsAreEqual(t, doc, updated)

          done()
        })
      })

      done()
    })

    t.end()
  }
}

module.exports = test
