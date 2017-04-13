'use strict'

const editContactForm = require('../forms/edit-contact-form')
const activityFeed = require('../forms/activity-feed')

module.exports = {
  url: 'http://localhost:3000/contacts',
  elements: {
    contactInfo: '[data-id=contact-info]'
  },
  sections: {
    info: {
      selector: '[data-id=contact-info]',
      elements: {
        editContactInfoButton: '[data-id=edit-contact-info-button]',
        editContactCampaignsButton: '[data-id=edit-contact-campaigns-button]',
        editContactMasterListsButton: '[data-id=edit-contact-master-lists-button]',
        editContactTagsButton: '[data-id=edit-contact-tags-button]'
      }
    },
    addToCampaign: {
      selector: '[data-id=add-contacts-to-campaign-form]',
      elements: {
        searchInput: '[data-id=add-contacts-to-campaign-search-input]',
        searchResults: '[data-id=campaign-list-search-results]',
        addButton: '[data-id=add-button]'
      },
      commands: [{
        searchForCampaign: function (campaign) {
          this.waitForElementVisible('@searchInput')
          this.clearValue('@searchInput')
          this.setValue('@searchInput', campaign.name)

          this.waitForElementVisible('@searchResults')

          return this
        },
        selectSearchResult: function (campaign) {
          this.waitForElementPresent('@addButton')
          this.moveToElement('@addButton', 1, 1)
          this.waitForElementVisible('@addButton')
          this.click('@addButton')

          this.waitForElementNotPresent(this.selector)

          return this
        }
      }]
    },
    editContactForm: editContactForm,
    activityFeed: activityFeed
  },
  commands: [{
    navigate: function (contact) {
      this.api.url('http://localhost:3000/contact/' + contact.slug)
      this.waitForElementVisible(this.section.info.selector)

      return this
    },
    editContact: function () {
      this.section.info
        .waitForElementVisible('@editContactInfoButton')
        .click('@editContactInfoButton')
        .waitForElementVisible(this.section.editContactForm.selector)

      return this
    }
  }]
}
