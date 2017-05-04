'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')
const faker = require('faker')

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

  'Should cancel deleting an existing contact': function (t) {
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

  'Should add contact to contact list from contact page': function (t) {
    t.createDomain(['contact', 'contactList'], (contact, contactList, done) => {
      const contactPage = t.page.contact()
        .navigate(contact)

      contactPage.section.info
        .waitForElementVisible('@editContactMasterListsButton')
        .click('@editContactMasterListsButton')

      const contactListsModal = contactPage.section.contactListsModal

      contactPage.waitForElementVisible(contactListsModal.selector)

      contactListsModal
        .selectList(contactList)
        .save()

      t.page.main().waitForSnackbarMessage('update-contact-contact-lists-success')

      contactPage.section.info.assert.attributeContains('a[data-id=contact-list-link]', 'href', `/contacts?list=${contactList.slug}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove contact from contact list from contact page': function (t) {
    t.createDomain(['contact', 'contactList'], (contact, contactList, done) => {
      t.perform((done) => {
        t.addContactsToContactLists([contact], [contactList], () => done())
      })

      const contactPage = t.page.contact()
        .navigate(contact)

      contactPage.section.info
        .waitForElementVisible('@editContactMasterListsButton')
        .click('@editContactMasterListsButton')

      const contactListsModal = contactPage.section.contactListsModal

      contactPage.waitForElementVisible(contactListsModal.selector)

      contactListsModal
        .deselectList(contactList)
        .save()

      t.page.main().waitForSnackbarMessage('update-contact-contact-lists-success')

      contactPage.section.info.assert.elementNotPresent('a[data-id=contact-list-link]')

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should add tags to contact on contact page': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`

    t.createDomain(['contact'], (contact, done) => {
      const contactPage = t.page.contact()
        .navigate(contact)

      contactPage.section.info
        .waitForElementVisible('@editContactTagsButton')
        .click('@editContactTagsButton')

      const tagSelectorModal = contactPage.section.tagSelectorModal

      contactPage.waitForElementVisible(tagSelectorModal.selector)

      contactPage.section.tagSelectorModal
        .addTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('update-contact-tags-success')

      contactPage.section.info.assert.attributeContains('a[data-id=tag-link]', 'href', `/contacts?tag=${tag}`)

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should remove tags from contact on contact page': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`

    t.createDomain(['contact', 'contactList'], (contact, contactList, done) => {
      t.perform((done) => {
        t.tagContacts([contact], [tag], () => done())
      })

      const contactPage = t.page.contact()
        .navigate(contact)

      contactPage.section.info.assert.attributeContains('a[data-id=tag-link]', 'href', `/contacts?tag=${tag}`)

      contactPage.section.info
        .waitForElementVisible('@editContactTagsButton')
        .click('@editContactTagsButton')

      const tagSelectorModal = contactPage.section.tagSelectorModal

      contactPage.waitForElementVisible(tagSelectorModal.selector)

      contactPage.section.tagSelectorModal
        .removeTag(tag)
        .save()

      t.page.main().waitForSnackbarMessage('update-contact-tags-success')

      contactPage.section.info.assert.elementNotPresent('a[data-id=tag-link]')

      done()
    })

    t.page.main().logout()
    t.end()
  },

  'Should cancel removing tags from contact on contact page': function (t) {
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`

    t.createDomain(['contact', 'contactList'], (contact, contactList, done) => {
      t.perform((done) => {
        t.tagContacts([contact], [tag], () => done())
      })

      const contactPage = t.page.contact()
        .navigate(contact)

      contactPage.section.info.assert.attributeContains('a[data-id=tag-link]', 'href', `/contacts?tag=${tag}`)

      contactPage.section.info
        .waitForElementVisible('@editContactTagsButton')
        .click('@editContactTagsButton')

      const tagSelectorModal = contactPage.section.tagSelectorModal

      contactPage.waitForElementVisible(tagSelectorModal.selector)

      contactPage.section.tagSelectorModal
        .removeTag(tag)
        .cancel()

      contactPage.section.info.assert.attributeContains('a[data-id=tag-link]', 'href', `/contacts?tag=${tag}`)

      done()
    })

    t.page.main().logout()
    t.end()
  }
}

module.exports = test
