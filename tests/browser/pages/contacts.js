'use strict'

const editContactForm = require('../forms/edit-contact-form')
const contactTable = require('../forms/contact-table')

module.exports = {
  url: 'http://localhost:3000/contacts',
  elements: {
    contactActionsButton: '[data-id=contact-actions-button]',
    importContactsButton: '[data-id=import-contacts-button]',
    saveAndImportContactsButton: '[data-id=save-and-import-contacts-button]',
    newContactButton: '[data-id=new-contact-button]'
  },
  sections: {
    upload: {
      selector: '[data-id=contacts-import]',
      elements: {
        importContactsButton: '[data-id=import-contacts-button]',
        fileInput: '[data-id=file-input]',
        uploadContactsButton: '[data-id=upload-contacts-button]'
      }
    },
    importComplete: {
      selector: '[data-id=contacts-import-complete]',
      elements: {
        status: '[data-id=contacts-import-complete-status]'
      }
    },
    editContactForm: editContactForm,
    contactTable: contactTable
  },
  commands: [{
    uploadCsvFile: function (path) {
      // if we don't have an empty database, need to click the drop down arrow to
      // find the 'import contacts' button
      this.ifElementPresent('[data-id=contact-actions-button]', () => {
        this.click('@contactActionsButton')
      })

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
