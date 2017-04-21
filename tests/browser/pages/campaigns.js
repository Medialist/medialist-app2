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
        addToMasterList: '[data-id=campaign-actions-add-to-master-list]',
        addToMyCampaigns: '[data-id=campaign-actions-add-to-my-campaigns]',
        addTags: '[data-id=campaign-actions-add-tags]',
        deleteCampaigns: '[data-id=campaign-actions-delete]'
      },
      commands: [{
        viewContacts: function () {
          this
            .waitForElementVisible('@viewContacts')
            .click('@viewContacts')
        }
      }]
    }
  },
  commands: [{

  }]
}
