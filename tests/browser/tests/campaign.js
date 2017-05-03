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
  },

  'Should add contact to campaign from contact page': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      const contactPage = t.page.contact()
        .navigate(contact)

      contactPage.section.info
        .waitForElementVisible('@editContactCampaignsButton')
        .click('@editContactCampaignsButton')

      const campaignSelectorModal = contactPage.section.campaignSelectorModal

      contactPage.waitForElementVisible(campaignSelectorModal.selector)

      campaignSelectorModal
        .searchForCampaign(campaign)
        .selectSearchResult(campaign)

      t.page.main().waitForSnackbarMessage('batch-add-contacts-to-campaign-success')

      contactPage.section.info.assert.attributeContains('[data-id=contact-campaigns-list] a', 'href', `/campaign/${campaign.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add campaign to campaign list from campaign page': function (t) {
    t.createDomain(['campaign', 'campaignList'], (campaign, campaignList, done) => {
      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage.section.info
        .waitForElementVisible('@editCampaignMasterListsButton')
        .click('@editCampaignMasterListsButton')

      const campaignListsModal = campaignPage.section.campaignListsModal

      campaignPage.waitForElementVisible(campaignListsModal.selector)

      campaignListsModal
        .selectList(campaignList)
        .save()

      t.page.main().waitForSnackbarMessage('update-campaign-campaign-lists-success')

      campaignPage.section.info.assert.attributeContains('a[data-id=campaign-list-link]', 'href', `/campaigns?list=${campaignList.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove campaign from campaign list from campaign page': function (t) {
    t.createDomain(['campaign', 'campaignList'], (campaign, campaignList, done) => {
      t.perform((done) => {
        t.addCampaignsToCampaignLists([campaign], [campaignList], () => done())
      })

      const campaignPage = t.page.campaign()
        .navigate(campaign)

      campaignPage.section.info
        .waitForElementVisible('@editCampaignMasterListsButton')
        .click('@editCampaignMasterListsButton')

      const campaignListsModal = campaignPage.section.campaignListsModal

      campaignPage.waitForElementVisible(campaignListsModal.selector)

      campaignListsModal
        .deselectList(campaignList)
        .save()

      t.page.main().waitForSnackbarMessage('update-campaign-campaign-lists-success')

      campaignPage.section.info.assert.elementNotPresent('a[data-id=campaign-list-link]')

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
