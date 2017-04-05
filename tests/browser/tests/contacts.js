'use strict'

const faker = require('faker')
const tmp = require('tmp')
const fs = require('fs')
const createContact = require('../fixtures/contacts').createContact
const verifyContactsAreEqual = require('../fixtures/contacts').verifyContactsAreEqual

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
    const contact = createContact()

    t.page.main()
      .navigateToContacts(t)
      .waitForElementVisible('@newContactButton')
      .createContact(contact)

    t.perform(function (done) {
      t.db.findContact({
        name: contact.name
      })
      .then(function (doc) {
        verifyContactsAreEqual(t, contact, doc)

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

  'Should edit an existing contact': function (t) {
    const contact = createContact()
    const updated = createContact()

    t.page.main()
      .navigateToContacts(t)
      .createContact(contact)

    t.page.main()
      .navigateToContacts(t)
      .searchForContact(contact.name)
      .selectSearchResult(contact.name)
      .editContact()
      .verifyEditFormContents(contact)
      .updateContact(updated)

    t.perform(function (done) {
      t.db.findContact({
        name: updated.name
      })
      .then(function (doc) {
        verifyContactsAreEqual(t, updated, doc)

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
