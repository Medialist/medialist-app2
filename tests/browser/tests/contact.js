'use strict'

const domain = require('../fixtures/domain')
const assertions = require('../fixtures/assertions')
const faker = require('faker')

const test = {
  '@tags': ['contact'],

  beforeEach: (t) => {
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

  'Should edit an existing contact and extract usernames': function (t) {
    t.createDomain(['contact'], (contact, done) => {
      const contactPage = t.page.contact()
        .navigate(contact)
        .editContact()

      const updated = domain.contact()
      const updatedWithSocialUrls = Object.assign({}, updated, {
        socials: [{
          label: 'Website',
          value: updated.socials[0].value
        }, {
          label: 'Twitter',
          value: `https://www.twitter.com/${updated.socials[1].value}`
        }, {
          label: 'LinkedIn',
          value: `https://www.linkedin.com/in/${updated.socials[2].value}/`
        }, {
          label: 'Facebook',
          value: `https://www.facebook.com/${updated.socials[3].value}`
        }, {
          label: 'YouTube',
          value: `https://www.youtube.com/user/${updated.socials[4].value}`
        }, {
          label: 'Instagram',
          value: `https://www.instagram.com/${updated.socials[5].value}/`
        }, {
          label: 'Medium',
          value: `https://medium.com/${updated.socials[6].value}`
        }, {
          label: 'Pinterest',
          value: `https://uk.pinterest.com/${updated.socials[7].value}/`
        }, {
          label: 'Website',
          value: updated.socials[8].value
        }]
      })

      contactPage.section.editContactForm
        .verifyEditFormContents(contact)
        .populate(updatedWithSocialUrls)
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
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

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
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['contact', 'contactList'], (contact, contactList, done) => {
      t.perform((done) => {
        t.tagContact(contact, [tag], () => done())
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
    const tag = `${faker.hacker.noun()}-${faker.hacker.noun()}-${faker.hacker.noun()}`.toLowerCase().replace(/[^a-z0-9_-]/g, '')

    t.createDomain(['contact', 'contactList'], (contact, contactList, done) => {
      t.perform((done) => {
        t.tagContact(contact, [tag], () => done())
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
