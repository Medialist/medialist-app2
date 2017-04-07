
module.exports = {
  url: 'http://localhost:3000/contacts/import',
  elements: {
    importContactsButton: '[data-id=import-contacts-button]',
    saveAndImportContactsButton: '[data-id=save-and-import-contacts-button]',
    fileInput: '[data-id=file-input]',
    uploadContactsButton: '[data-id=upload-contacts-button]',
    status: '[data-id=contacts-import-complete-status]'
  },
  commands: [{
    uploadCsvFile: function (path) {
      this
        .waitForElementPresent('@fileInput')
        .setValue('@fileInput', path)
        .waitForElementVisible('@uploadContactsButton')
        .click('@uploadContactsButton')

      return this
    },
    completeImport: function () {
      this.waitForElementVisible('@saveAndImportContactsButton')
      this.click('@saveAndImportContactsButton')

      return this
    }
  }]
}
