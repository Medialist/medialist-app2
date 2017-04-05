'use strict'

const createCampaign = require('../fixtures/campaigns').createCampaign
const verifyCampaignsAreEqual = require('../fixtures/campaigns').verifyCampaignsAreEqual

const test = {
  '@tags': ['campaigns'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should create new campaign': function (t) {
    const campaign = createCampaign()

    t.page.main()
      .navigateToCampaigns(t)
      .createCampaign(campaign)

    const campaignPage = t.page.campaign()
    campaignPage.section.details.waitForElementVisible('@title')

    t.perform(function (done) {
      t.db.findCampaign({
        name: campaign.name
      })
      .then(function (doc) {
        t.assert.urlEquals(`http://localhost:3000/campaign/${doc.slug}`)

        verifyCampaignsAreEqual(t, doc, campaign)

        campaignPage.section.details.assert.containsText('@title', doc.name)
        campaignPage.section.details.assert.containsText('@client', doc.client.name)
        campaignPage.section.details.assert.containsText('@keyMessage', doc.purpose)
        campaignPage.section.details.assert.attributeContains('@link0', 'href', campaign.links[0])
        campaignPage.section.details.assert.attributeContains('@link1', 'href', campaign.links[1])
        campaignPage.section.details.assert.attributeContains('@link2', 'href', campaign.links[2])
        campaignPage.section.activity.assert.containsText('@createCampaignPost', 'You\ncreated this campaign')

        done()
      })
      .catch(function (error) {
        console.info(error.stack)

        done()
      })
    })

    t.page.main().logout()
    t.end()
  },

  'Should edit an existing campaign': function (t) {
    const campaign = createCampaign()
    const updated = createCampaign()

    t.page.main()
      .navigateToCampaigns(t)
      .createCampaign(campaign)

    t.page.main()
      .navigateToCampaigns(t)
      .searchForCampaign(campaign.name)
      .selectSearchResult(campaign.name)
      .editCampaign()
      .verifyEditFormContents(campaign)
      .updateCampaign(updated)

    t.perform(function (done) {
      t.db.findCampaign({
        name: updated.name
      })
      .then(function (doc) {
        verifyCampaignsAreEqual(t, doc, updated)

        done()
      })
      .catch(function (error) {
        console.info(error.stack)

        done()
      })
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
