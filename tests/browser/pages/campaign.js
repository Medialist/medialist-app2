'use strict'

module.exports = {
  url: 'http://localhost:3000/campaigns',
  sections: {
    details: {
      selector: '#campaign-details',
      elements: {
        title: '#campaign-name',
        client: '#campaign-client',
        keyMessage: '#campaign-key-message',
        links: '.campaign-link',
        teamMembers: '#campaign-team-members',
        masterLists: '#campaign-master-lists',
        tags: '#campaign-tags'
      }
    },
    activity: {
      selector: '#activity-feed',
      elements: {
        feedbackPost: '.feedback-post .post-text',
        coveragePost: '.coverage-post .post-text',
        needToKnowPost: '.need-to-know-post .post-text',
        statusUpdatePost: '.status-update .post-text',
        addContactsToCampaignPost: '.add-contacts-to-campaign .post-text',
        createCampaignPost: '.create-campaign .post-text'
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
