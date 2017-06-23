'use strict'

const activityFeed = require('../components/activity-feed')

module.exports = {
  url: 'http://localhost:3000/',
  elements: {

  },
  sections: {
    activityFeed: activityFeed('dashboard')
  },
  commands: [{
    navigate: function () {
      this.api.url('http://localhost:3000/')
      this.waitForElementVisible(this.section.activityFeed.selector)

      return this
    }
  }]
}
