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

      t.page.main().waitForSnackbarMessage('contact-update-success')

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

    t.page.main().logout()
    t.end()
  },

  'Should delete an existing contact': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactPage = t.page.contact()
        .navigate(contact)
        .editContact()

      contactPage.section.editContactForm
        .openDeleteConfirmation(contact)
        .confirmDeletion()

      t.page.main().waitForSnackbarMessage('contact-delete-success')

      t.assert.urlEquals('http://localhost:3000/contacts')

      t.page.contacts().section.contactTable
        .searchForWithoutFinding(contact.name)
        .assertNotInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should cancel delete an existing contact': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactPage = t.page.contact()
        .navigate(contact)
        .editContact()

      contactPage.section.editContactForm
        .openDeleteConfirmation(contact)
        .cancelDeletion()

      // should have gone back to edit contact form
      contactPage.assert.visible(contactPage.section.editContactForm.selector)

      contactPage.section.editContactForm
        .cancel()

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add contact to campaign from contact page': function (t) {
    t.createDomain(['campaign', 'contact'], (campaign, contact, done) => {
      t.page.contact().navigate(contact)

      const contactPage = t.page.contact()
      const infoSection = contactPage.section.info
      const campaignSelectorModal = contactPage.section.campaignSelectorModal

      infoSection.waitForElementVisible('@editContactCampaignsButton')
      infoSection.click('@editContactCampaignsButton')

      contactPage.waitForElementVisible(campaignSelectorModal.selector)

      campaignSelectorModal
        .searchForCampaign(campaign)
        .selectSearchResult(campaign)

      t.page.main().waitForSnackbarMessage('batch-add-contacts-to-campaign-success')

      infoSection.assert.attributeContains('[data-id=contact-campaigns-list] a', 'href', `/campaign/${campaign.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
