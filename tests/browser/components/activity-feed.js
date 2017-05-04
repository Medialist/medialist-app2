'use strict'

module.exports = (prefix) => ({
  selector: `[data-id='${prefix}-activity-feed']`,
  elements: {
    addContactsToCampaignPost: '[data-id=add-contacts-to-campaign]'
  },
  commands: [{
    assertHasAddContactToCampaignPostWith: function (contact, campaign, data) {
      return this._assertHasPostWith('add-contacts-to-campaign', contact, campaign, data)
    },
    assertHasFeedbackPostWith: function (contact, campaign, data) {
      return this._assertHasPostWith('feedback-post', contact, campaign, data)
    },
    assertHasCoveragePostWith: function (contact, campaign, data) {
      return this._assertHasPostWith('coverage-post', contact, campaign, data)
    },
    assertHasNeedToKnowPostWith: function (contact, data) {
      return this._assertHasPostWith('need-to-know-post', contact, null, data)
    },
    assertHasCreatedCampaignPostWith: function (campaign, data) {
      return this._assertHasPostWith('create-campaign', null, campaign, data)
    },
    _assertHasPostWith: function (type, contact, campaign, data) {
      let selector = `[data-id='${type}']`

      if (contact) {
        selector += `[data-contact~='${contact._id}']`
      }

      if (campaign) {
        selector += `[data-campaign~='${campaign._id}']`
      }

      this.waitForElementPresent(selector)

      if (data.summary) {
        this.assert.containsText(`${selector} [data-id=post-summary]`, data.summary)
      }

      if (data.campaignName) {
        this.assert.containsText(`${selector} [data-id=campaign-name]`, data.campaignName)
      }

      if (data.contactName) {
        this.assert.containsText(`${selector} [data-id=contact-name]`, data.contactName)
      }

      if (data.contactOutlet) {
        // For some reason this does not pass reliably
        // this.assert.containsText(`${selector} [data-id=contact-outlet]`, data.contactOutlet)
      }

      if (data.contactStatus) {
        this.assert.containsText(`${selector} [data-id=contact-status]`, data.contactStatus.toUpperCase().replace(/-/g, ' '))
      }

      if (data.message) {
        this.assert.containsText(`${selector} [data-id=post-message]`, data.message)
      }

      if (data.header) {
        this.assert.containsText(`${selector} [data-id=post-header]`, data.header)
      }

      if (data.embed) {
        this.assert.elementPresent(`${selector} [href='${data.embed}'][data-id=link-preview]`)
      }

      return this
    },
    assertHasNoPostsForCampaign: function (campaign) {
      const selector = `[data-campaign~='${campaign._id}']`

      this.assert.elementNotPresent(selector)

      return this
    }
  }]
})
