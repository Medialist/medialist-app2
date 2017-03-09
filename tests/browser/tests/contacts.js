'use strict'

const path = require('path')

const test = {
  '@tags': ['contacts'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should import contacts': function (t) {
    const file = path.resolve(path.join(__dirname, '../fixtures/contacts.csv'))

    const contactsPage = t.page.main()
      .navigateToContacts(t)
      .uploadCsvFile(file)
      .completeImport()

    contactsPage.section.importComplete.waitForElementVisible('@status')
    contactsPage.section.importComplete.assert.containsText('@status', 'Created 0 contacts and updated 1 contacts.')

    t.end()
  }
}

module.exports = test
