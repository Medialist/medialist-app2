'use strict'

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {
    newCampaignButton: '[data-id=create-campaign-button]'
  },
  sections: {
    editCampaignForm: {
      selector: '[data-id=edit-campaign-form]',
      elements: {
        campaignNameInput: '[data-id=campaign-name-input]',
        clientInput: '[data-id=client-input]',
        keyMessageInput: '[data-id=key-message-input]',
        linksInput: '[data-id=links-input-0]',
        addLinksButton: '[data-id=add-links-button]',
        saveCampaignButton: '[data-id=save-campaign-button]'
      }
    }
  },
  commands: [{
    createCampaign: function (campaign) {
      this
        .waitForElementVisible('@newCampaignButton')
        .click('@newCampaignButton')

      const form = this.section.editCampaignForm

      form.waitForElementVisible('@campaignNameInput')
      form.sendKeys('@campaignNameInput', campaign.name)
      form.sendKeys('@clientInput', campaign.client)
      form.sendKeys('@keyMessageInput', campaign.keyMessage)
      form.sendKeys('@linksInput', campaign.link)
      form.click('@saveCampaignButton')

      this.waitForElementNotPresent(this.section.editCampaignForm.selector)

      return this
    }
  }]
}
