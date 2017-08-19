'use strict'

const activityFeed = require('../components/activity-feed')

module.exports = {
  url: function () {
    return this.api.launchUrl
  },
  elements: {

  },
  sections: {
    activityFeed: activityFeed('dashboard'),
    recentCampaignsList: {
      selector: '[data-id=recent-campaigns-list]'
    },
    recentContactsList: {
      selector: '[data-id=recent-contacts-list]'
    }
  },
  commands: [{
    navigate: function () {
      this.api.url('http://localhost:3000/')
      this.waitForElementVisible(this.section.activityFeed.selector)

      return this
    },

    clickRecentCampaignLink: function (campaignSlug) {
      const selector = `[href="/campaign/${campaignSlug}"]`
      this.section.recentCampaignsList
        .waitForElementVisible(selector)
        .click(selector)

      return this
    },

    clickRecentContactLink: function (contactSlug) {
      const selector = `[href="/contact/${contactSlug}"]`
      this.section.recentCampaignsList
        .waitForElementVisible(selector)
        .click(selector)

      return this
    }
  }]
}
