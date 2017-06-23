'use strict'

module.exports = {
  selector: '[data-id=dropdown-menu]',
  elements: {
    Completed: '[data-id=contact-status-completed]',
    'Hot Lead': '[data-id=contact-status-hot-lead]',
    Contacted: '[data-id=contact-status-contacted]',
    'To Contact': '[data-id=contact-status-to-contact]',
    'Not Interested': '[data-id=contact-status-not-interested]'
  },
  commands: [{
    selectStatus: function (status) {
      this
        .waitForElementVisible(`@${status}`)
        .click(`@${status}`)

      return this
    }
  }]
}
