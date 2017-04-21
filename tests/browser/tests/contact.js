'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')

const test = {
  '@tags': ['contact'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should edit an existing contact': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactPage = t.page.contact()
        .navigate(contact)
        .editContact()

      const updated = domain.contact()

      contactPage.section.editContactForm
        .verifyEditFormContents(contact)
        .populate(updated)
        .submit()

      t.perform((done) => {
        t.db.findContact({
          name: updated.name
        })
        .then((doc) => {
          assertions.contactsAreEqual(t, updated, doc)

          done()
        })
      })

      done()
    })

    t.end()
  },

  'Should add contact to campaign from contact page': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.page.contact().navigate(contact)

      const contactPage = t.page.contact()
      const infoSection = contactPage.section.info
      const addToCampaign = contactPage.section.addToCampaign

      infoSection.waitForElementVisible('@editContactCampaignsButton')
      infoSection.click('@editContactCampaignsButton')

      contactPage.waitForElementVisible(addToCampaign.selector)

      addToCampaign
        .searchForCampaign(campaign)
        .selectSearchResult(campaign)

      infoSection.assert.attributeContains('[data-id=contact-campaigns-list] a', 'href', `/campaign/${campaign.slug}`)

      done()
    })

    t.end()
  }
}

module.exports = test
