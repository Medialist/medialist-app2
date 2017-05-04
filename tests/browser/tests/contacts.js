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

    t.page.contactImport()
      .navigate()
      .uploadCsvFile(file.name)
      .completeImport()
      .waitForElementVisible('@status')
      .assert.containsText('@status', 'Created 1 contacts and updated 0 contacts.')

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

    t.page.main().waitForSnackbarMessage('contact-create-success')

    t.perform((done) => {
      t.db.findContact({
        name: contact.name
      })
      .then((doc) => {
        t.assert.urlEquals(`http://localhost:3000/contact/${doc.slug}`)

        assertions.contactsAreEqual(t, contact, doc)

        done()
      })
    })

    t.page.main().logout()
    t.end()
  },

  'Should search for contacts': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.main()
        .navigateToContacts(t)

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .clickRow(0)

      t.assert.urlEquals(`http://localhost:3000/contact/${contact.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add contacts to a campaign from toast menu': function (t) {
    t.createDomain(['contact', 'campaign'], (contact, campaign, done) => {
      const contactsPage = t.page.main()
        .navigateToContacts(t)

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.section.toast.openAddContactsToCampaignModal()

      contactsPage.section.campaignSelectorModal
        .searchForCampaign(campaign)
        .selectSearchResult(campaign)

      t.page.main().waitForSnackbarMessage('batch-add-contacts-to-campaign-success')

      const campaignContactsPage = t.page.campaignContacts()
        .navigate(campaign)

      campaignContactsPage.section.contactTable
        .assertInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add to contact list from toast menu': function (t) {
    t.createDomain(['contactList', 'contact'], (contactList, contact, done) => {
      const contactsPage = t.page.contacts()
        .navigate()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.section.toast.openAddToContactListsModal()
      contactsPage.section.contactListsModal
        .selectList(contactList)
        .save()

      t.page.main().waitForSnackbarMessage('contacts-batch-add-to-contact-list-success')

      contactsPage
        .navigateToContactList(contactList)

      contactsPage.section.contactTable
        .assertInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should favourite contacts from toast menu': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.contacts()
        .navigate()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.section.toast.favouriteContacts()

      t.page.main().waitForSnackbarMessage('batch-favourite-contacts-success')

      contactsPage
        .navigateToMyContacts()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .assertInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add tags to contacts from toast menu': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`

    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.contacts()
        .navigate()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.section.toast.openAddTagsToContactsModal()

      contactsPage.section.tagSelectorModal
        .addTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('batch-tag-contacts-success')

      contactsPage
        .navigateToTag(tag)

      contactsPage.section.contactTable
        .assertInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should delete contacts from toast menu': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactsPage = t.page.contacts()
        .navigate()

      contactsPage.section.contactTable
        .searchFor(contact.name)
        .selectRow(0)

      contactsPage.section.toast.openDeleteContactsModal()

      contactsPage.section.deleteContactsModal
        .confirm()

      t.page.main().waitForSnackbarMessage('batch-delete-contacts-success')

      contactsPage.section.contactTable
        .assertNoResults()
        .assertNotInSearchResults(contact)

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
