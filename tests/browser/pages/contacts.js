'use strict'

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
      // if we don't have an empty database, need to click the drop down arrow to
      // find the 'import contacts' button
      this.api.element('css selector', '[data-id=contact-actions-button]', (result) => {
        if (result.value && result.value.ELEMENT) {
          this.click('@contactActionsButton')
        }
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
    },
    createContact: function (contact) {
      this
        .click('@newContactButton')
        .waitForElementVisible(this.section.editContactForm.selector)

      const form = this.section.editContactForm

      form.clearValue(`@nameInput`)
      form.setValue(`@nameInput`, contact.name)

      form.clearValue(`@jobTitleInput`)
      form.setValue(`@jobTitleInput`, contact.outlets[0].title)
      form.clearValue(`@jobCompanyInput`)
      form.setValue(`@jobCompanyInput`, contact.outlets[0].company)

      form.waitForElementVisible('@addJobButton')
      form.click(`@addJobButton`)
      form.waitForElementVisible('@otherJobTitleInput')

      form.clearValue(`@otherJobTitleInput`)
      form.setValue(`@otherJobTitleInput`, contact.outlets[1].title)
      form.clearValue(`@otherJobCompanyInput`)
      form.setValue(`@otherJobCompanyInput`, contact.outlets[1].company)

      form.clearValue(`@emailInput`)
      form.setValue(`@emailInput`, contact.emails[0])

      form.waitForElementVisible('@addEmailButton')
      form.click(`@addEmailButton`)
      form.waitForElementVisible('@otherEmailInput')

      form.clearValue(`@otherEmailInput`)
      form.setValue(`@otherEmailInput`, contact.emails[1])

      form.clearValue(`@phoneInput`)
      form.setValue(`@phoneInput`, contact.phones[0])

      form.waitForElementVisible('@addPhoneButton')
      form.click(`@addPhoneButton`)
      form.waitForElementVisible('@otherPhoneInput')

      form.clearValue(`@otherPhoneInput`)
      form.setValue(`@otherPhoneInput`, contact.phones[1])

      form.waitForElementVisible('@addSocialButton')
      form.click(`@addSocialButton`)
      form.waitForElementVisible('@otherWebsiteInput')

      Object.keys(contact.socials).forEach(key => {
        form.clearValue(`@${key}Input`)
        form.setValue(`@${key}Input`, contact.socials[key])
      })

      form.click('@submitButton')

      this.waitForElementNotPresent(this.section.editContactForm.selector)

      return this
    }
  }]
}
