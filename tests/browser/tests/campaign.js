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

      t.page.main().waitForSnackbarMessage('campaign-update-success')

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

    t.page.main().logout()
    t.end()
  },

  'Should delete an existing campaign': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)
        .editCampaign()

      campaignPage.section.editCampaignForm
        .openDeleteConfirmation(campaign)
        .confirmDeletion()

      t.page.main().waitForSnackbarMessage('campaign-delete-success')

      t.assert.urlEquals('http://localhost:3000/campaigns')

      t.page.campaigns().section.campaignTable
        .searchForWithoutFinding(campaign.name)
        .assertNotInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should cancel deleting an existing campaign': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)
        .editCampaign()

      campaignPage.section.editCampaignForm
        .openDeleteConfirmation(campaign)
        .cancelDeletion()

      // should have gone back to edit campaign form
      campaignPage.assert.visible(campaignPage.section.editCampaignForm.selector)

      campaignPage.section.editCampaignForm
        .cancel()

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
