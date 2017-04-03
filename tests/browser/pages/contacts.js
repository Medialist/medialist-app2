'use strict'

module.exports = {
  url: 'http://localhost:3000/contacts',
  elements: {
    contactActionsButton: '[data-id=contact-actions-button]',
    importContactsButton: '[data-id=import-contacts-button]',
    saveAndImportContactsButton: '[data-id=save-and-import-contacts-button]',
    newContactButton: '[data-id=new-contact-button]',
    editContactForm: '[data-id=edit-contact-form]'
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
    editContactForm: {
      selector: '[data-id=edit-contact-form]',
      elements: {
        nameInput: '[data-id=contact-name-input]',
        jobTitleInput: '[data-id=job-title-input-0]',
        jobCompanyInput: '[data-id=job-company-input-0]',
        otherJobTitleInput: '[data-id=job-title-input-1]',
        otherJobCompanyInput: '[data-id=job-company-input-1]',
        addJobButton: '[data-id=add-job-button]',
        emailInput: '[data-id=email-input-0]',
        otherEmailInput: '[data-id=email-input-1]',
        addEmailButton: '[data-id=add-email-button]',
        phoneInput: '[data-id=phone-input-0]',
        otherPhoneInput: '[data-id=phone-input-1]',
        addPhoneButton: '[data-id=add-phone-button]',
        websiteInput: '[data-id=social-input-website]',
        twitterInput: '[data-id=social-input-twitter]',
        linkedinInput: '[data-id=social-input-linkedin]',
        facebookInput: '[data-id=social-input-facebook]',
        youtubeInput: '[data-id=social-input-youtube]',
        instagramInput: '[data-id=social-input-instagram]',
        mediumInput: '[data-id=social-input-medium]',
        pinterestInput: '[data-id=social-input-pinterest]',
        otherWebsiteInput: '[data-id=social-input-8]',
        addSocialButton: '[data-id=add-social-button]',
        submitButton: '[data-id=edit-contact-form-submit-button]'
      }
    }
  },
  commands: [{
    uploadCsvFile: function (path) {
      // this.waitForElementVisible('@contactActionsButton')
      // this.click('@contactActionsButton')
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