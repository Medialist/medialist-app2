'use strict'

const masterListsSelector = require('../components/masterlists-selector')
const editContactForm = require('../components/edit-contact-form')
const contactTable = require('../components/contact-table')
const addtoListsModal = require('../components/add-to-lists-modal')
const tagSelectorModal = require('../components/tag-selector-modal')
const campaignSelectorModal = require('../components/campaign-selector-modal')

module.exports = {
  url: 'http://localhost:3000/contacts',
  elements: {
    newContactButton: '[data-id=new-contact-button]',
    myContactsButton: '[data-slug=my]'
  },
  sections: {
    masterListsSelector: masterListsSelector,
    editContactForm: editContactForm,
    contactTable: contactTable,
    toast: {
      selector: '[data-id=contact-actions-toast]',
      elements: {
        addContactsToCampaign: '[data-id=contact-actions-add-to-campaign]',
        addToContactList: '[data-id=contact-actions-add-to-contact-list]',
        addToMyContacts: '[data-id=contact-actions-add-to-my-contacts]',
        addTagsToContacts: '[data-id=contact-actions-add-tags]',
        deleteContacts: '[data-id=contact-actions-delete]'
      },
      commands: [{
        openAddContactsToCampaignModal: function () {
          this
            .waitForElementVisible('@addContactsToCampaign')
            .click('@addContactsToCampaign')

          return this
        },
        openAddToContactListsModal: function () {
          this
            .waitForElementVisible('@addToContactList')
            .click('@addToContactList')

          return this
        },
        favouriteContacts: function () {
          this
            .waitForElementVisible('@addToMyContacts')
            .click('@addToMyContacts')

          return this
        },
        openAddTagsToContactsModal: function () {
          this
            .waitForElementVisible('@addTagsToContacts')
            .click('@addTagsToContacts')

          return this
        },
        openDeleteContactsModal: function () {
          this
            .waitForElementVisible('@deleteContacts')
            .click('@deleteContacts')

          return this
        }
      }]
    },
    campaignSelectorModal: campaignSelectorModal,
    contactListsModal: addtoListsModal('add-to-list-modal'),
    tagSelectorModal: tagSelectorModal('tag-selector-modal')
  },
  commands: [{
    navigateToContactList: function (contactList) {
      this.api.url('http://localhost:3000/contacts?list=' + contactList.slug)
      this.waitForElementVisible(this.section.contactTable.selector)

      return this
    },
    navigateToMyContacts: function () {
      this.navigate()
        .waitForElementVisible('@myContactsButton')
        .click('@myContactsButton')
        .waitForElementVisible(this.section.contactTable.selector)

      return this
    },
    navigateToTag: function (tag) {
      this.api.url('http://localhost:3000/contacts?tag=' + tag)
      this.waitForElementVisible(this.section.contactTable.selector)

      return this
    }
  }]
}
