'use strict'

module.exports = {
  url: 'http://localhost:3000/contacts',
  elements: {
    contactActionsButton: '[data-id=contact-actions-button]',
    importContactsButton: '[data-id=import-contacts-button]',
    saveAndImportContactsButton: '[data-id=save-and-import-contacts-button]',
    newContactButton: '[data-id=new-contact-button]',
    searchContactsInput: '[data-id=search-contacts-input]',
    editContactButton: '[data-id=edit-contact-button]',
    contactLink: '[data-id=contact-link]',
    contactsTable: '[data-id=contacts-table]',
    contactsTableSearchResults: '[data-id=contacts-table-search-results]'
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
    },
    createContact: function (contact) {
      this
        .click('@newContactButton')
        .waitForElementVisible(this.section.editContactForm.selector)
        .fillInContactFormAnSubmit(contact)

      return this
    },
    searchForContact: function (query) {
      this.waitForElementVisible('@searchContactsInput')
      this.clearValue('@searchContactsInput')
      this.setValue('@searchContactsInput', query)
      this.waitForElementVisible('@contactsTableSearchResults')

      return this
    },
    selectSearchResult: function (query) {
      this.waitForElementVisible('@contactLink')
      this.click('@contactLink')

      return this
    },
    editContact: function () {
      this
        .waitForElementVisible('@editContactButton')
        .click('@editContactButton')
        .waitForElementVisible(this.section.editContactForm.selector)

      return this
    },
    updateContact: function (updated) {
      this
        .fillInContactFormAnSubmit(updated)

      return this
    },
    verifyEditFormContents: function (contact) {
      const form = this.section.editContactForm

      form.assert.attributeEquals('@nameInput', 'value', contact.name)

      contact.outlets.forEach((outlet, index) => {
        form.assert.attributeEquals(`[data-id=job-title-input-${index}]`, 'value', outlet.title)
        form.assert.attributeEquals(`[data-id=job-company-input-${index}]`, 'value', outlet.company)
      })

      contact.emails.forEach((value, index) => {
        form.assert.attributeEquals(`[data-id=email-input-${index}]`, 'value', value)
      })

      contact.phones.forEach((value, index) => {
        form.assert.attributeEquals(`[data-id=phone-input-${index}]`, 'value', value)
      })

      Object.keys(contact.socials).forEach((key, index) => {
        form.assert.attributeEquals(`[data-id=social-input-${index}]`, 'value', contact.socials[key])
      })

      return this
    },
    fillInContactFormAnSubmit: function (contact) {
      const form = this.section.editContactForm

      form.clearValue(`@nameInput`)
      form.setValue(`@nameInput`, contact.name)

      contact.outlets.forEach((outlet, index) => {
        const jobInput = `[data-id=job-title-input-${index}]`
        const companyInput = `[data-id=job-company-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(jobInput, () => {
            form.waitForElementVisible('@addJobButton')
            form.click(`@addJobButton`)
            form.waitForElementVisible(jobInput)
          })
        }

        form.clearValue(jobInput)
        form.setValue(jobInput, outlet.title)
        form.clearValue(companyInput)
        form.setValue(companyInput, outlet.company)
      })

      contact.emails.forEach((value, index) => {
        const input = `[data-id=email-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(input, () => {
            form.waitForElementVisible('@addEmailButton')
            form.click(`@addEmailButton`)
            form.waitForElementVisible(input)
          })
        }

        form.clearValue(input)
        form.setValue(input, value)
      })

      contact.phones.forEach((value, index) => {
        const input = `[data-id=phone-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(input, () => {
            form.waitForElementVisible('@addPhoneButton')
            form.click(`@addPhoneButton`)
            form.waitForElementVisible(input)
          })
        }

        form.clearValue(input)
        form.setValue(input, value)
      })

      Object.keys(contact.socials).forEach((key, index) => {
        const input = `[data-id=social-input-${index}]`

        if (index > 7) {
          this.ifElementNotPresent(input, () => {
            form.waitForElementVisible('@addSocialButton')
            form.click(`@addSocialButton`)
            form.waitForElementVisible(input)
          })
        }

        form.clearValue(input)
        form.clearValue(input)
        form.setValue(input, contact.socials[key])
      })

      form.click('@submitButton')

      this.waitForElementNotPresent(this.section.editContactForm.selector)
    }
  }]
}
