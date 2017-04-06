'use strict'

const editCampaignForm = require('../forms/edit-campaign-form')

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {
    newCampaignButton: '[data-id=create-campaign-button]',
    searchCampaignsInput: '[data-id=search-campaigns-input]',
    editCampaignButton: '[data-id=edit-campaign-button]',
    campaignLink: '[data-id=campaign-link]',
    campaignsTable: '[data-id=campaigns-table]',
    campaignsTableSearchResults: '[data-id=campaigns-table-search-results]'
  },
  sections: {
    editCampaignForm: editCampaignForm
  },
  commands: [{
    searchForCampaign: function (query) {
      this.waitForElementVisible('@searchCampaignsInput')
      this.clearValue('@searchCampaignsInput')
      this.setValue('@searchCampaignsInput', query)
      this.waitForElementVisible('@campaignsTableSearchResults')

      return this
    },
    selectSearchResult: function (query) {
      this.waitForElementVisible('@campaignLink')
      this.click('@campaignLink')

      return this
    }
  }]
}
