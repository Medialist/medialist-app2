'use strict'

const editCampaignForm = require('../forms/edit-campaign-form')
const campaignTable = require('../forms/campaign-table')

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {
    newCampaignButton: '[data-id=create-campaign-button]',
    editCampaignButton: '[data-id=edit-campaign-button]'
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
        addTags: '[data-id=campaign-actions-add-tags]',
        deleteCampaigns: '[data-id=campaign-actions-delete]'
      },
      commands: [{
        viewContacts: function () {
          this
            .waitForElementVisible('@viewContacts')
            .click('@viewContacts')
        },
        addToCampaignList: function (campaignList) {
          this
            .waitForElementVisible('@addToCampaignList')
            .click('@addToCampaignList')
        }
      }]
    },
    campaignListsModal: {
      selector: '[data-id=add-to-list-modal]',
      elements: {
        saveButton: '[data-id=add-to-list-modal-save-button]',
        cancelButton: '[data-id=add-to-list-modal-cancel-button]',
        manageListsButton: '[data-id=add-to-list-modal-manage-lists-button]'
      },
      commands: [{
        addToCampaignList: function (campaignList) {
          const selector = `[data-id=master-list-button][data-item='${campaignList._id}']`

          this
            .waitForElementVisible(selector)
            .click(selector)
        }
      }]
    }
  },
  commands: [{

  }]
}
