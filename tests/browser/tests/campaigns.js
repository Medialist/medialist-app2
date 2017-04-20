'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')

const test = {
  '@tags': ['campaigns'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should create new campaign': function (t) {
    const campaignsPage = t.page.main()
      .navigateToCampaigns(t)

    campaignsPage.waitForElementVisible('@newCampaignButton')
      .click('@newCampaignButton')
      .waitForElementVisible(campaignsPage.section.editCampaignForm.selector)

    const campaign = domain.campaign()

    campaignsPage.section.editCampaignForm
      .populate(campaign)
      .submit()

    t.perform((done) => {
      t.db.findCampaign({
        name: campaign.name
      })
      .then(function (doc) {
        t.assert.urlEquals(`http://localhost:3000/campaign/${doc.slug}`)

        assertions.campaignsAreEqual(t, doc, campaign)

        const campaignPage = t.page.campaign()
        const info = campaignPage.section.info

        info.assert.containsText('@title', doc.name)
        info.assert.containsText('@client', doc.client.name)
        info.assert.containsText('@keyMessage', doc.purpose)
        info.assert.attributeContains('@link0', 'href', doc.links[0].url)
        info.assert.attributeContains('@link1', 'href', doc.links[1].url)
        info.assert.attributeContains('@link2', 'href', doc.links[2].url)

        campaignPage.section.activityFeed
          .assertHasCreatedCampaignPostWith(doc, {
            header: 'You\ncreated this campaign'
          })

        done()
      })
    })

    t.page.main().logout()
    t.end()
  },

  'Should search for campaigns': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      t.page.main()
        .navigateToCampaigns(t)
        .searchForCampaign(campaign.name)
        .selectSearchResult(campaign.name)

      t.assert.urlEquals(`http://localhost:3000/campaign/${campaign.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
