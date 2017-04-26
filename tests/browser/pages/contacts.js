'use strict'

const editContactForm = require('../forms/edit-contact-form')
const contactTable = require('../forms/contact-table')
const addtoListsModal = require('../forms/add-to-lists-modal')
const tagSelectorModal = require('../forms/tag-selector-modal')
const deleteModal = require('../forms/delete-modal')
const campaignSelectorModal = require('../forms/campaign-selector-modal')

module.exports = {
  url: 'http://localhost:3000/contacts',
  elements: {
    newContactButton: '[data-id=new-contact-button]'
  },
  sections: {
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
    tagSelectorModal: tagSelectorModal('tag-selector-modal'),
    deleteContactsModal: deleteModal('delete-contacts-modal')
  },
  commands: [{

  }]
}
