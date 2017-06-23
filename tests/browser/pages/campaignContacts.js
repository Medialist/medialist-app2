'use strict'

const contactTable = require('../components/contact-table')
const addtoListsModal = require('../components/add-to-lists-modal')
const tagSelectorModal = require('../components/tag-selector-modal')
const deleteModal = require('../components/delete-modal')
const dropdown = require('../components/status-dropdown')
const campaignSelectorModal = require('../components/campaign-selector-modal')

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {

  },
  sections: {
    removeContactsConfirmation: {
      selector: '[data-id=remove-contact-from-campaign]',
      elements: {
        confirm: '[data-id=confirm-remove-contact-from-campaign-button]',
        cancel: '[data-id=cancel-remove-contact-from-campaign-button]'
      }
    },
    toast: {
      selector: '[data-id=contact-actions-toast]',
      elements: {
        addContactsToCampaign: '[data-id=contact-actions-add-to-campaign]',
        addToContactList: '[data-id=contact-actions-add-to-contact-list]',
        addToMyContacts: '[data-id=contact-actions-add-to-my-contacts]',
        addTagsToContacts: '[data-id=contact-actions-add-tags]',
        openContactsStatusDropdown: '[data-id=contact-actions-update-status]',
        removeContacts: '[data-id=contact-actions-remove]'
      },
      sections: { dropdown },
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
        openRemoveContactsModal: function () {
          this
            .waitForElementVisible('@removeContacts')
            .click('@removeContacts')

          return this
        },
        openStatusDropdown: function () {
          this
            .waitForElementVisible('@openContactsStatusDropdown')
            .click('@openContactsStatusDropdown')

          return this
        }
      }]
    },
    contactTable: contactTable,
    campaignSelectorModal: campaignSelectorModal,
    contactListsModal: addtoListsModal('add-to-list-modal'),
    tagSelectorModal: tagSelectorModal('tag-selector-modal'),
    removeContactsModal: deleteModal('remove-contacts-from-campaigns-modal')
  },
  commands: [{
    navigate: function (campaign) {
      this.api.url(`http://localhost:3000/campaign/${campaign.slug}/contacts`)
      this.waitForElementVisible(this.section.contactTable.selector)

      return this
    }
  }]
}
