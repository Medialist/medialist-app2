'use strict'

module.exports = {
  url: 'http://localhost:3000/campaigns',
  elements: {
    newCampaignButton: '#create-campaign-button',
    campaignNameInput: '#campaign-name-input',
    clientInput: '#client-input',
    keyMessageInput: '#key-message-input',
    linksInput: '.links-input',
    addLinksButton: '#add-links-button',
    saveCampaignButton: '#save-campaign-button'
  },
  commands: [{
    createCampaign: function (campaign) {
      return this
        .waitForElementVisible('@newCampaignButton')
        .click('@newCampaignButton')
        .waitForElementVisible('@campaignNameInput')
        .sendKeys('@campaignNameInput', campaign.name)
        .sendKeys('@clientInput', campaign.client)
        .sendKeys('@keyMessageInput', campaign.keyMessage)
        .sendKeys('@linksInput', campaign.link)
        .click('@saveCampaignButton')
    }
  }]
}
