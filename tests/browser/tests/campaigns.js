'use strict'

const faker = require('faker')

const test = {
  '@tags': ['campaigns'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should create new campaign': function (t) {
    const campaign = {
      name: faker.company.catchPhrase(),
      client: faker.company.companyName(),
      keyMessage: faker.hacker.phrase(),
      link: faker.internet.url()
    }

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

        t.assert.equal(doc.name, campaign.name)
        t.assert.equal(doc.client.name, campaign.client)
        t.assert.equal(doc.purpose, campaign.keyMessage)
        t.assert.equal(doc.links.length, 1)
        t.assert.equal(doc.links[0].url, campaign.link)

        campaignPage.section.details.assert.containsText('@title', doc.name)
        campaignPage.section.details.assert.containsText('@client', doc.client.name)
        campaignPage.section.details.assert.containsText('@keyMessage', doc.purpose)
        campaignPage.section.details.assert.attributeContains('@link0', 'href', campaign.link)
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
  }
}

module.exports = test
