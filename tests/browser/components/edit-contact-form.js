'use strict'

module.exports = {
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
    submitButton: '[data-id=edit-contact-form-submit-button]',
    cancelButton: '[data-id=edit-contact-form-cancel-button]',
    deleteContactButton: '[data-id=delete-contact-button]',
    confirmDeleteContactButton: '[data-id=confirm-delete-contact-button]',
    cancelDeleteContactButton: '[data-id=cancel-delete-contact-button]'
  },
  commands: [{
    verifyEditFormContents: function (contact) {
      this.assert.attributeEquals('@nameInput', 'value', contact.name)

      contact.outlets.forEach((outlet, index) => {
        this.assert.attributeEquals(`[data-id=job-title-input-${index}]`, 'value', outlet.value)
        this.assert.attributeEquals(`[data-id=job-company-input-${index}]`, 'value', outlet.label)
      })

      contact.emails.forEach((email, index) => {
        this.assert.attributeEquals(`[data-id=email-input-${index}]`, 'value', email.value)
      })

      contact.phones.forEach((phone, index) => {
        this.assert.attributeEquals(`[data-id=phone-input-${index}]`, 'value', phone.value)
      })

      contact.socials.forEach((social, index) => {
        this.assert.attributeEquals(`[data-id=social-input-${index}]`, 'value', social.value)
      })

      return this
    },
    populate: function (contact) {
      this.clearValue(`@nameInput`)
      this.setValue(`@nameInput`, contact.name)

      contact.outlets.forEach((outlet, index) => {
        const jobInput = `[data-id=job-title-input-${index}]`
        const companyInput = `[data-id=job-company-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(jobInput, () => {
            this.waitForElementVisible('@addJobButton')
            this.click(`@addJobButton`)
            this.waitForElementVisible(jobInput)
          })
        }

        this.clearValue(jobInput)
        this.setValue(jobInput, outlet.value)
        this.clearValue(companyInput)
        this.setValue(companyInput, outlet.label)
      })

      contact.emails.forEach((email, index) => {
        const input = `[data-id=email-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(input, () => {
            this.waitForElementVisible('@addEmailButton')
            this.click(`@addEmailButton`)
            this.waitForElementVisible(input)
          })
        }

        this.clearValue(input)
        this.setValue(input, email.value)
      })

      contact.phones.forEach((phone, index) => {
        const input = `[data-id=phone-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(input, () => {
            this.waitForElementVisible('@addPhoneButton')
            this.click(`@addPhoneButton`)
            this.waitForElementVisible(input)
          })
        }

        this.clearValue(input)
        this.setValue(input, phone.value)
      })

      contact.socials.forEach((social, index) => {
        const input = `[data-id=social-input-${index}]`

        if (index > 7) {
          this.ifElementNotPresent(input, () => {
            this.waitForElementVisible('@addSocialButton')
            this.click(`@addSocialButton`)
            this.waitForElementVisible(input)
          })
        }

        this.clearValue(input)
        this.clearValue(input)
        this.setValue(input, social.value)
      })

      return this
    },
    submit: function () {
      this.click('@submitButton')

      this.waitForElementNotPresent(this.selector)

      return this
    },
    cancel: function () {
      this.click('@cancelButton')

      this.waitForElementNotPresent(this.selector)

      return this
    },
    openDeleteConfirmation: function () {
      this.waitForElementPresent('@deleteContactButton')
      this.click('@deleteContactButton')

      this.waitForElementPresent('@confirmDeleteContactButton')

      return this
    },
    confirmDeletion: function () {
      this.waitForElementPresent('@confirmDeleteContactButton')
      this.click('@confirmDeleteContactButton')

      this.waitForElementNotPresent(this.selector)

      return this
    },
    cancelDeletion: function () {
      this.waitForElementPresent('@cancelDeleteContactButton')
      this.click('@cancelDeleteContactButton')

      this.waitForElementNotVisible('@cancelDeleteContactButton')

      return this
    }
  }]
}
