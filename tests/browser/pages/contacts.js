'use strict'

module.exports = {
  url: 'http://localhost:3000/contacts',
  elements: {
    contactActionsButton: '#contact-actions-button',
    importContactsButton: '#import-contacts-button',
    saveAndImportContactsButton: '#save-and-import-contacts-button'
  },
  sections: {
    upload: {
      selector: '#contacts-import',
      elements: {
        importContactsButton: '#import-contacts-button',
        fileInput: '#file-input',
        uploadContactsButton: '#upload-contacts-button'
      }
    },
    importComplete: {
      selector: '#contacts-import-complete',
      elements: {
        status: '#contacts-import-complete-status'
      }
    }
  },
  commands: [{
    uploadCsvFile: function (path) {
      this.waitForElementVisible('@contactActionsButton')
      this.click('@contactActionsButton')
      this.waitForElementVisible('@importContactsButton')
      this.click('@importContactsButton')
      this.section.upload.setValue('@fileInput', path)
      this.section.upload.waitForElementVisible('@uploadContactsButton')
      this.section.upload.click('@uploadContactsButton')

      return this
    },
    completeImport: function () {
      this.waitForElementVisible('@saveAndImportContactsButton')
      this.click('@saveAndImportContactsButton')

      return this
    }
  }]
}
