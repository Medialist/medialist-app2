'use strict'

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
    editCampaignForm: {
      selector: '[data-id=edit-campaign-form]',
      elements: {
        campaignNameInput: '[data-id=campaign-name-input]',
        clientInput: '[data-id=client-input]',
        keyMessageInput: '[data-id=key-message-input]',
        linkInput: '[data-id=link-input-0]',
        addLinkButton: '[data-id=add-link-button]',
        submitButton: '[data-id=save-campaign-button]'
      }
    }
  },
  commands: [{
    createCampaign: function (campaign) {
      this
        .waitForElementVisible('@newCampaignButton')
        .click('@newCampaignButton')

      this
        .fillInCampaignFormAndSubmit(campaign)

      return this
    },
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
    },
    editCampaign: function () {
      this
        .waitForElementVisible('@editCampaignButton')
        .click('@editCampaignButton')
        .waitForElementVisible(this.section.editCampaignForm.selector)

      return this
    },
    updateCampaign: function (updated) {
      this
        .fillInCampaignFormAndSubmit(updated)

      return this
    },
    verifyEditFormContents: function (campaign) {
      const form = this.section.editCampaignForm

      form.assert.attributeEquals('@campaignNameInput', 'value', campaign.name)
      form.assert.attributeEquals('@clientInput', 'value', campaign.client)
      form.assert.attributeEquals('@keyMessageInput', 'value', campaign.keyMessage)

      campaign.links.forEach((value, index) => {
        form.assert.attributeEquals(`[data-id=link-input-${index}]`, 'value', value)
      })

      return this
    },
    fillInCampaignFormAndSubmit: function (campaign) {
      const form = this.section.editCampaignForm

      form.clearValue(`@campaignNameInput`)
      form.setValue(`@campaignNameInput`, campaign.name)

      form.clearValue(`@clientInput`)
      form.setValue(`@clientInput`, campaign.client)

      form.clearValue(`@keyMessageInput`)
      form.setValue(`@keyMessageInput`, campaign.keyMessage)

      campaign.links.forEach((value, index) => {
        const input = `[data-id=link-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(input, () => {
            form.waitForElementVisible('@addLinkButton')
            form.click(`@addLinkButton`)
            form.waitForElementVisible(input)
          })
        }

        form.clearValue(input)
        form.setValue(input, value)
      })

      form.click('@submitButton')

      this.waitForElementNotPresent(form.selector)
    }
  }]
}
