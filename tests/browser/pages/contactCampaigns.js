'use strict'

const campaignTable = require('../components/campaign-table')
const addtoListsModal = require('../components/add-to-lists-modal')
const tagSelectorModal = require('../components/tag-selector-modal')
const deleteModal = require('../components/delete-modal')

module.exports = {
  url: function () {
    return this.api.launchUrl + '/contacts'
  },
  elements: {
    newCampaignButton: '[data-id=create-campaign-button]',
    editCampaignButton: '[data-id=edit-campaign-button]',
    myCampaignsButton: '[data-slug=my]'
  },
  sections: {
    campaignTable: campaignTable,
    toast: {
      selector: '[data-id=campaign-actions-toast]',
      elements: {
        viewContacts: '[data-id=campaign-actions-view-contacts]',
        addToCampaignList: '[data-id=campaign-actions-add-to-campaign-list]',
        addToMyCampaigns: '[data-id=campaign-actions-add-to-my-campaigns]',
        addTagsToCampaign: '[data-id=campaign-actions-add-tags]',
        removeContactsFromCampaigns: '[data-id=campaign-actions-remove-contacts]'
      },
      commands: [{
        viewContacts: function () {
          this
            .waitForElementVisible('@viewContacts')
            .click('@viewContacts')

          return this
        },
        openAddToCampaignListsModal: function () {
          this
            .waitForElementVisible('@addToCampaignList')
            .click('@addToCampaignList')

          return this
        },
        favouriteCampaigns: function () {
          this
            .waitForElementVisible('@addToMyCampaigns')
            .click('@addToMyCampaigns')

          return this
        },
        openAddTagsToCampaignModal: function () {
          this
            .waitForElementVisible('@addTagsToCampaign')
            .click('@addTagsToCampaign')

          return this
        },
        openRemoveContactsFRomCampaignsModal: function () {
          this
            .waitForElementVisible('@removeContactsFromCampaigns')
            .click('@removeContactsFromCampaigns')

          return this
        }
      }]
    },
    campaignListsModal: addtoListsModal('add-to-list-modal'),
    tagSelectorModal: tagSelectorModal('tag-selector-modal'),
    removeContactsFromCampaignsModal: deleteModal('remove-contacts-from-campaigns-modal')
  },
  commands: [{
    navigateToCampaignList: function (contact) {
      this.api.url(`http://localhost:3000/contact/${contact.slug}/campaigns`)
      this.waitForElementVisible(this.section.campaignTable.selector)

      return this
    },
    navigateToTag: function (contact, tag) {
      this.api.url(`http://localhost:3000/contact/${contact.slug}/campaigns?tag=${tag}`)
      this.waitForElementVisible(this.section.campaignTable.selector)

      return this
    }
  }]
}
