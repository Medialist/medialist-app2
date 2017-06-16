'use strict'

const faker = require('faker')

const test = {
  '@tags': ['contact-campaigns'],

  beforeEach: function (t) {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should search for campaigns': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
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

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact1)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.viewContacts()

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
    t.createDomain(['campaignList', 'campaign', 'contact'], (campaignList, campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.openAddToCampaignListsModal()
      contactCampaignsPage.section.campaignListsModal
        .selectList(campaignList)
        .save()

      t.page.main().waitForSnackbarMessage('campaigns-batch-add-to-campaign-list-success')

      const campaignsPage = t.page.campaigns()
        .navigate()

      campaignsPage
        .navigateToCampaignList(campaignList)

      campaignsPage.section.campaignTable
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should favourite campaigns from toast menu': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.favouriteCampaigns()

      t.page.main().waitForSnackbarMessage('campaigns-batch-favourite-success')

      const campaignsPage = t.page.campaigns()
        .navigateToMyCampaigns()

      campaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add tags to campaigns from toast menu': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.openAddTagsToCampaignModal()

      contactCampaignsPage.section.tagSelectorModal
        .addTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('campaigns-batch-tag-success')

      const campaignsPage = t.page.campaigns()
        .navigateToTag(tag)

      campaignsPage.section.campaignTable
        .assertInSearchResults(campaign)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove contact from campaigns from toast menu': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.perform((done) => {
        t.addContactsToCampaign([contact], campaign, () => done())
      })

      const contactCampaignsPage = t.page.contactCampaigns()
        .navigateToCampaignList(contact)

      contactCampaignsPage.section.campaignTable
        .searchFor(campaign.name)
        .selectRow(0)

      contactCampaignsPage.section.toast.openRemoveContactsFRomCampaignsModal()

      contactCampaignsPage.section.removeContactsFromCampaignsModal
        .confirm()

      t.page.main().waitForSnackbarMessage('batch-remove-contacts-from-campaign-success')

      contactCampaignsPage.section.campaignTable
        .assertNoResults()
        .assertNotInSearchResults(campaign)

      t.perform((done) => {
        t.db.findContacts({
          campaigns: {
            $in: [campaign.slug]
          }
        })
        .then((docs) => {
          t.assert.equal(docs.length, 0)

          done()
        })
      })

      t.perform((done) => {
        t.db.findCampaign({
          _id: campaign._id
        })
        .then((doc) => {
          t.assert.equal(doc.contacts[contact._id], undefined)

          done()
        })
      })

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
