'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')
const faker = require('faker')

const test = {
  '@tags': ['campaigns'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },
/*
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

    t.page.main().waitForSnackbarMessage('campaign-create-success')

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
      const campaignsPage = t.page.main()
        .navigateToCampaigns(t)

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .clickRow(0)

      t.assert.urlEquals(`http://localhost:3000/campaign/${campaign.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should view campaign contacts from toast menu': function (t) {
    t.createDomain(['campaign', 'contact', 'contact', 'contact'], (campaign, contact1, contact2, contact3, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact1, contact2], campaign, () => done())
      })

      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      campaignsPage.section.toast.viewContacts()

      t.assert.urlEquals(`http://localhost:3000/contacts?campaign=${campaign.slug}`)

      t.page.contacts()
        .section.contactTable.isInResults(contact1)

      t.page.contacts()
        .section.contactTable.isInResults(contact2)

      t.page.contacts()
        .section.contactTable.isNotInResults(contact3)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add to campaign list from toast menu': function (t) {
    t.createDomain(['campaignList', 'campaign'], (campaignList, campaign, done) => {
      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      campaignsPage.section.toast.openAddToCampaignListsModal()
      campaignsPage.section.campaignListsModal
        .selectCampaignList(campaignList)
        .save()

      t.page.main().waitForSnackbarMessage('campaigns-batch-add-to-campaign-list-success')

      campaignsPage
        .navigateToCampaignList(campaignList)

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should favourite campaigns from toast menu': function (t) {
    t.createDomain(['campaign'], (campaign, done) => {
      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      campaignsPage.section.toast.favouriteCampaigns()

      t.page.main().waitForSnackbarMessage('campaigns-batch-favourite-success')

      campaignsPage
        .navigateToMyCampaigns()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },
*/
  'Should add tags to campaigns from toast menu': function (t) {
    const tag = faker.hacker.noun()

    t.createDomain(['campaign'], (campaign, done) => {
      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      campaignsPage.section.toast.openAddTagsToCampaignModal()

      campaignsPage.section.tagSelectorModal
        .addTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('campaigns-batch-tag-success')

      campaignsPage
        .navigateToMyCampaigns()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
