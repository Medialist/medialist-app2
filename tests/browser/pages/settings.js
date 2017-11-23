'use strict'

const listsTable = require('../components/lists-table')
const deleteModal = require('../components/delete-modal')

module.exports = {
  url: function () {
    return this.api.launchUrl + '/settings'
  },
  elements: {
    profileSettingsButton: '[data-id=profile-settings-button]',
    campaignListsButton: '[data-id=campaign-lists-button]',
    contactListsButton: '[data-id=contact-lists-button]'
  },
  sections: {
    profile: {
      selector: '[data-id=profile-settings-panel]',
      elements: {
        nameField: 'input[name=name]',
        emailField: 'input[name=email]',
        updateProfileButton: '[data-id=update-profile-button]'
      }
    },
    campaignLists: listsTable('campaign-lists'),
    contactLists: listsTable('contact-lists'),
    deleteListsModal: deleteModal('delete-lists-modal')
  },
  commands: [{
    navigateToCampaignLists: function () {
      this
        .navigate()
        .waitForElementVisible('@campaignListsButton')
        .click('@campaignListsButton')
        .waitForElementVisible(this.section.campaignLists.selector)

      return this
    },
    navigateToContactLists: function () {
      this
        .navigate()
        .waitForElementVisible('@contactListsButton')
        .click('@contactListsButton')
        .waitForElementVisible(this.section.contactLists.selector)

      return this
    }
  }]
}
