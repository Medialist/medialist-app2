'use strict'

const editCampaignForm = require('../components/edit-campaign-form')
const campaignTable = require('../components/campaign-table')
const addtoListsModal = require('../components/add-to-lists-modal')
const tagSelectorModal = require('../components/tag-selector-modal')
const deleteModal = require('../components/delete-modal')

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {
    newCampaignButton: '[data-id=create-campaign-button]',
    editCampaignButton: '[data-id=edit-campaign-button]',
    myCampaignsButton: '[data-slug=my]'
  },
  sections: {
    editCampaignForm: editCampaignForm,
    campaignTable: campaignTable,
    toast: {
      selector: '[data-id=campaign-actions-toast]',
      elements: {
        viewContacts: '[data-id=campaign-actions-view-contacts]',
        addToCampaignList: '[data-id=campaign-actions-add-to-campaign-list]',
        addToMyCampaigns: '[data-id=campaign-actions-add-to-my-campaigns]',
        addTagsToCampaign: '[data-id=campaign-actions-add-tags]',
        deleteCampaigns: '[data-id=campaign-actions-delete]'
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
        openDeleteCampaignsModal: function () {
          this
            .waitForElementVisible('@deleteCampaigns')
            .click('@deleteCampaigns')

          return this
        }
      }]
    },
    campaignListsModal: addtoListsModal('add-to-list-modal'),
    tagSelectorModal: tagSelectorModal('tag-selector-modal'),
    deleteCampaignsModal: deleteModal('delete-campaigns-modal')
  },
  commands: [{
    navigateToCampaignList: function (campaignList) {
      this.api.url('http://localhost:3000/campaigns?list=' + campaignList.slug)
      this.waitForElementVisible(this.section.campaignTable.selector)

      return this
    },
    navigateToMyCampaigns: function () {
      this.navigate()
        .waitForElementVisible('@myCampaignsButton')
        .click('@myCampaignsButton')
        .waitForElementVisible(this.section.campaignTable.selector)

      return this
    },
    navigateToTag: function (tag) {
      this.api.url(`http://localhost:3000/campaigns?tag=${tag}`)
      this.waitForElementVisible(this.section.campaignTable.selector)

      return this
    }
  }]
}
