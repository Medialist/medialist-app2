'use strict'

const createPostSelector = (type, contact, campaign) => {
  let postSelector = `[data-id='${type}']`

  if (contact) {
    postSelector += `[data-contact~='${contact._id}']`
  }

  if (campaign) {
    postSelector += `[data-campaign~='${campaign._id}']`
  }

  return postSelector
}

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
    assertHasStatusUpdatePostWith: function (campaign, data) {
      return this._assertHasPostWith('status-update', null, campaign, data)
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

      if (!campaign && data.campaignName) {
        this.assert.containsText(`${selector} [data-id=campaign-name]`, data.campaignName)
      }

      if (!contact && data.contactName) {
        this.assert.containsText(`${selector} [data-id=contact-name]`, data.contactName)
      }

      if (data.contactOutlet) {
        const outletSelector = `${selector} [data-id=contact-outlet]`

        // Often hidden in ellipsis - workaround get via textContent instead getText
        // https://github.com/seleniumhq/selenium-google-code-issue-archive/issues/5773
        this.getAttribute(outletSelector, 'textContent', ({ value }) => {
          this.assert.ok(
            (value || '').indexOf(data.contactOutlet) > -1,
            `Testing if element <${outletSelector}> contains text: "${data.contactOutlet}".`
          )
        })
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
        this.waitForElementPresent(selector)
        this.assert.elementPresent(`${selector} [href='${data.embed}'][data-id=link-preview]`)
      }

      return this
    },
    deleteCoveragePostWith: function (contact, campaign) {
      return this._deletePostWith('coverage-post', contact, campaign)
    },
    _deletePostWith: function (type, contact, campaign) {
      let postSelector = createPostSelector(type, contact, campaign)

      const confirmDeletePostSelector = `${postSelector} [data-id=confirm-button]`

      this
        ._openDeleteModal(type, contact, campaign)
        .waitForElementPresent(confirmDeletePostSelector)
        .click(confirmDeletePostSelector)
        .waitForElementNotPresent(postSelector)

      return this
    },
    cancelDeleteCoveragePostWith: function (contact, campaign) {
      return this._cancelDeletePostWith('coverage-post', contact, campaign)
    },
    _cancelDeletePostWith: function (type, contact, campaign) {
      let postSelector = createPostSelector(type, contact, campaign)

      const cancelDeletePostSelector = `${postSelector} [data-id=cancel-button]`
      const deletePostModalSelector = `${postSelector} [data-id=delete-post-modal]`

      this
        ._openDeleteModal(type, contact, campaign)
        .waitForElementPresent(cancelDeletePostSelector)
        .click(cancelDeletePostSelector)
        .waitForElementNotPresent(deletePostModalSelector)

      return this
    },
    _openDeleteModal: function (type, contact, campaign) {
      let postSelector = createPostSelector(type, contact, campaign)

      const openDropDownSelector = `${postSelector} [data-id=open-post-menu-button]`
      const deletePostSelector = `${postSelector} [data-id=delete-post-button]`
      const deletePostModalSelector = `${postSelector} [data-id=delete-post-modal]`

      this
        .waitForElementPresent(openDropDownSelector)
        .click(openDropDownSelector)
        .waitForElementPresent(deletePostSelector)
        .click(deletePostSelector)
        .waitForElementPresent(deletePostModalSelector)

      return this
    },
    assertHasPostsForCampaign: function (campaign) {
      const selector = `[data-campaign~='${campaign._id}']`

      this.waitForElementPresent(selector)
      this.assert.elementPresent(selector)

      return this
    },
    assertHasNoPostsForCampaign: function (campaign) {
      const selector = `[data-campaign~='${campaign._id}']`

      this.assert.elementNotPresent(selector)

      return this
    },
    assertHasCoveragePostsForCampaign: function (campaign) {
      return this._assertHasPostForCampaign('coverage-post', campaign)
    },
    _assertHasPostForCampaign: function (type, campaign) {
      const selector = `[data-id='${type}'][data-campaign~='${campaign._id}']`

      this.waitForElementPresent(selector)
      this.assert.elementPresent(selector)

      return this
    },
    assertHasNoCoveragePostsForCampaign: function (campaign) {
      return this._assertHasNoPostForCampaign('coverage-post', campaign)
    },
    _assertHasNoPostForCampaign: function (type, campaign) {
      const selector = `[data-id='${type}'][data-campaign~='${campaign._id}']`

      this.assert.elementNotPresent(selector)

      return this
    },

    assertHasCoveragePostsForContact: function (contact) {
      return this._assertHasPostForContact('coverage-post', contact)
    },
    _assertHasPostForContact: function (type, contact) {
      const selector = `[data-id='${type}'][data-contact~='${contact._id}']`

      this.waitForElementPresent(selector)
      this.assert.elementPresent(selector)

      return this
    },

    assertHasNoCoveragePostsForContact: function (contact) {
      return this._assertHasNoPostForContact('coverage-post', contact)
    },
    _assertHasNoPostForContact: function (type, contact) {
      const selector = `[data-id='${type}'][data-contact~='${contact._id}']`

      this.assert.elementNotPresent(selector)

      return this
    }
  }]
})
