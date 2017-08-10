'use strict'

module.exports = {
  selector: '[data-id=edit-contact-form]',
  elements: {
    nameInput: '[data-id=contact-name-input]',
    addJobButton: '[data-id=add-job-button]',
    addEmailButton: '[data-id=add-email-button]',
    addPhoneButton: '[data-id=add-phone-button]',
    websiteInput: '[data-id=social-input-website]',
    twitterInput: '[data-id=social-input-twitter]',
    linkedinInput: '[data-id=social-input-linkedin]',
    facebookInput: '[data-id=social-input-facebook]',
    youtubeInput: '[data-id=social-input-youtube]',
    instagramInput: '[data-id=social-input-instagram]',
    mediumInput: '[data-id=social-input-medium]',
    pinterestInput: '[data-id=social-input-pinterest]',
    addSocialButton: '[data-id=add-social-button]',
    addAddressButton: '[data-id=add-address-button]',
    submitButton: '[data-id=edit-contact-form-submit-button]',
    cancelButton: '[data-id=edit-contact-form-cancel-button]',
    deleteButton: '[data-id=delete-contact-button]',
    confirmDeleteButton: '[data-id=confirm-delete-contact-button]',
    cancelDeleteButton: '[data-id=cancel-delete-contact-button]'
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

      contact.addresses.forEach((address, index) => {
        Object.keys(address).forEach(field => {
          this.assert.attributeEquals(`[data-id=address-input-${field}-${index}]`, 'value', address[field])
        })
      })

      return this
    },
    populate: function (contact) {
      this.waitForElementVisible('@nameInput')
      this.clear('@nameInput')
      this.setValue('@nameInput', contact.name)

      contact.outlets.forEach((outlet, index) => {
        const jobInput = `[data-id=job-title-input-${index}]`
        const companyInput = `[data-id=job-company-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(jobInput, () => {
            this.waitForElementVisible('@addJobButton')
            this.click('@addJobButton')
          })
        }

        this.waitForElementVisible(jobInput)
        this.clear(jobInput)
        this.setValue(jobInput, outlet.value)
        this.clear(companyInput)
        this.setValue(companyInput, outlet.label)
      })

      contact.emails.forEach((email, index) => {
        const input = `[data-id=email-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(input, () => {
            this.waitForElementVisible('@addEmailButton')
            this.click('@addEmailButton')
          })
        }

        this.waitForElementVisible(input)
        this.clear(input)
        this.setValue(input, email.value)
      })

      contact.phones.forEach((phone, index) => {
        const input = `[data-id=phone-input-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(input, () => {
            this.waitForElementVisible('@addPhoneButton')
            this.click('@addPhoneButton')
          })
        }

        this.waitForElementVisible(input)
        this.clear(input)
        this.setValue(input, phone.value)
      })

      contact.socials.forEach((social, index) => {
        const input = `[data-id=social-input-${index}]`

        if (index > 7) {
          this.ifElementNotPresent(input, () => {
            this.waitForElementVisible('@addSocialButton')
            this.click('@addSocialButton')
          })
        }

        this.waitForElementVisible(input)
        this.clear(input)
        this.setValue(input, social.value)
      })

      contact.addresses.forEach((address, index) => {
        const input = `[data-id=address-input-street-${index}]`

        if (index > 0) {
          this.ifElementNotPresent(input, () => {
            this.waitForElementVisible('@addAddressButton')
            this.click('@addAddressButton')
            this.waitForElementVisible(input)
          })
        }

        Object.keys(address).forEach((field) => {
          const fieldSelector = `[data-id=address-input-${field}-${index}]`

          if (contact.addresses[index][field]) {
            this.waitForElementVisible(fieldSelector)
            this.clear(fieldSelector)
            this.setValue(fieldSelector, contact.addresses[index][field])
          }
        })
      })

      return this
    },
    populateJobTitle: function (index, value) {
      const selector = `[data-id=job-title-input-${index}]`

      if (index > 0) {
        this.ifElementNotPresent(selector, () => {
          this.waitForElementVisible('@addJobButton')
          this.click('@addJobButton')
        })
      }

      this.waitForElementVisible(selector)
      this.clear(selector)
      this.setValue(selector, value)

      return this
    },
    populateJobCompany: function (index, value) {
      const selector = `[data-id=job-company-input-${index}]`

      if (index > 0) {
        this.ifElementNotPresent(selector, () => {
          this.waitForElementVisible('@addJobButton')
          this.click('@addJobButton')
        })
      }

      this.waitForElementVisible(selector)
      this.clear(selector)
      this.setValue(selector, value)

      return this
    },
    assertJobTitleSuggestion: function (index, value) {
      const suggestion0Selector = `[data-id=job-title-input-${index}-suggestion-0]`
      const suggestionsSelector = `[data-id^=job-title-input-${index}-suggestion]`

      this.waitForElementVisible(suggestion0Selector)

      this.getElementsText(suggestionsSelector, (texts) => {
        this.assert.ok(
          texts.includes(value),
          `"${value}"" was in suggestions`
        )

        this.assert.equal(
          texts.filter((t) => t !== value).length,
          texts.length - 1,
          `"${value}" was not repeated in list`
        )
      })
    },
    assertJobCompanySuggestion: function (index, value) {
      const suggestion0Selector = `[data-id=job-company-input-${index}-suggestion-0]`
      const suggestionsSelector = `[data-id^=job-company-input-${index}-suggestion]`

      this.waitForElementVisible(suggestion0Selector)

      this.getElementsText(suggestionsSelector, (texts) => {
        this.assert.ok(
          texts.includes(value),
          `"${value}"" was in suggestions`
        )

        this.assert.equal(
          texts.filter((t) => t !== value).length,
          texts.length - 1,
          `"${value}" was not repeated in list`
        )
      })
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
      this.waitForElementPresent('@deleteButton')
      this.click('@deleteButton')

      this.waitForElementPresent('@confirmDeleteButton')

      return this
    },
    confirmDeletion: function () {
      this.waitForElementPresent('@confirmDeleteButton')
      this.click('@confirmDeleteButton')

      this.waitForElementNotPresent(this.selector)

      return this
    },
    cancelDeletion: function () {
      this.waitForElementPresent('@cancelDeleteButton')
      this.click('@cancelDeleteButton')

      this.waitForElementNotVisible('@cancelDeleteButton')

      return this
    }
  }]
}
