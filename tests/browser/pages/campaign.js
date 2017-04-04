'use strict'

module.exports = {
  url: 'http://localhost:3000/campaigns',
  sections: {
    details: {
      selector: '[data-id=campaign-details]',
      elements: {
        title: '[data-id=campaign-name]',
        client: '[data-id=campaign-client]',
        keyMessage: '[data-id=campaign-key-message]',
        link0: '[data-id=campaign-link-0]',
        teamMembers: '[data-id=campaign-team-members]',
        masterLists: '[data-id=campaign-master-lists]',
        tags: '[data-id=campaign-tags]'
      }
    },
    activity: {
      selector: '[data-id=activity-feed]',
      elements: {
        feedbackPost: '[data-id=feedback-post] [data-id=post-text]',
        coveragePost: '[data-id=coverage-post] [data-id=post-text]',
        needToKnowPost: '[data-id=need-to-know-post] [data-id=post-text]',
        statusUpdatePost: '[data-id=status-update] [data-id=post-text]',
        addContactsToCampaignPost: '[data-id=add-contacts-to-campaign] [data-id=post-text]',
        createCampaignPost: '[data-id=create-campaign] [data-id=post-text]'
      }
    }
  },
  commands: [{
    updateCampaign: function (campaign) {
      this
        .waitForElementVisible('@editCampaignButton')
        .click('@editCampaignButton')
        .waitForElementVisible('@campaignNameInput')
        .sendKeys('@campaignNameInput', campaign.name)
        .sendKeys('@clientInput', campaign.client)
        .sendKeys('@keyMessageInput', campaign.keyMessage)
        .sendKeys('@linksInput', campaign.link)
        .click('@saveCampaignButton')
        .waitForElementVisible('@campaignTitle')
    }
  }]
}
