'use strict'

const faker = require('faker')
const tmp = require('tmp')
const fs = require('fs')
const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')

const test = {
  '@tags': ['contacts'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should import contacts': function (t) {
    const file = tmp.fileSync()
    const contents = `Name, Email, Telephone
${faker.name.findName()}, ${faker.internet.email()}, ${faker.phone.phoneNumber()}`
    fs.writeFileSync(file.name, contents)

    const contactsPage = t.page.main()
      .navigateToContacts(t)
      .uploadCsvFile(file.name)
      .completeImport()

    contactsPage.section.importComplete.waitForElementVisible('@status')
    contactsPage.section.importComplete.assert.containsText('@status', 'Created 1 contacts and updated 0 contacts.')

    t.page.main().logout()
    t.end()
  },

  'Should create a new contact': function (t) {
    const contactsPage = t.page.main()
      .navigateToContacts(t)

    contactsPage.waitForElementVisible('@newContactButton')
      .click('@newContactButton')
      .waitForElementVisible(contactsPage.section.editContactForm.selector)

    const contact = domain.contact()

    contactsPage.section.editContactForm
      .populate(contact)
      .submit()

    t.perform((done) => {
      t.db.findContact({
        name: contact.name
      })
      .then((doc) => {
        assertions.contactsAreEqual(t, contact, doc)

        done()
      })
    })

    t.page.main().logout()
    t.end()
  },

  'Should edit an existing contact': function (t) {
    let contact

    t.createContact((c) => {
      contact = c
    })

    t.perform((done) => {
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

    t.page.main().logout()
    t.end()
  },

  'Should search for contacts': function (t) {
    let contact

    t.createContact((c) => {
      contact = c
    })

    t.perform((done) => {
      t.page.main()
        .navigateToContacts(t)
        .searchForContact(contact.name)
        .selectSearchResult(contact.name)

      t.assert.urlEquals(`http://localhost:3000/contact/${contact.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add contact to campaign from contact page': function (t) {
    let campaign
    let contact

    t.createCampaign((c) => {
      campaign = c
    })

    t.createContact((c) => {
      contact = c
    })

    t.perform((done) => {
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

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
