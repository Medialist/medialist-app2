'use strict'

const path = require('path')
const faker = require('faker')

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
    contactsPage.section.importComplete.assert.containsText('@status', 'Created 1 contacts and updated 0 contacts.')

    t.end()
  },

  'Should create a new contact': function (t) {
    const contact = {
      name: faker.name.findName(),
      outlets: [{
        title: faker.name.jobTitle(),
        company: faker.company.companyName()
      }, {
        title: faker.name.jobTitle(),
        company: faker.company.companyName()
      }],
      emails: [faker.internet.email(), faker.internet.email()],
      phones: [faker.phone.phoneNumber(), faker.phone.phoneNumber()],
      socials: {
        website: faker.internet.url(),
        twitter: faker.internet.userName(),
        linkedin: faker.internet.userName(),
        facebook: faker.internet.userName(),
        youtube: faker.internet.userName(),
        instagram: faker.internet.userName(),
        medium: faker.internet.userName(),
        pinterest: faker.internet.userName(),
        otherWebsite: faker.internet.url()
      }
    }

    const contactsPage = t.page.main()
      .navigateToContacts(t)
      .waitForElementVisible('@newContactButton')
      .click('@newContactButton')
      .waitForElementVisible('@editContactForm')

    contactsPage.section.editContactForm.clearValue(`@nameInput`)
    contactsPage.section.editContactForm.setValue(`@nameInput`, contact.name)

    contactsPage.section.editContactForm.clearValue(`@jobTitleInput`)
    contactsPage.section.editContactForm.setValue(`@jobTitleInput`, contact.outlets[0].title)
    contactsPage.section.editContactForm.clearValue(`@jobCompanyInput`)
    contactsPage.section.editContactForm.setValue(`@jobCompanyInput`, contact.outlets[0].company)

    contactsPage.section.editContactForm.waitForElementVisible('@addJobButton')
    contactsPage.section.editContactForm.click(`@addJobButton`)
    contactsPage.section.editContactForm.waitForElementVisible('@otherJobTitleInput')

    contactsPage.section.editContactForm.clearValue(`@otherJobTitleInput`)
    contactsPage.section.editContactForm.setValue(`@otherJobTitleInput`, contact.outlets[1].title)
    contactsPage.section.editContactForm.clearValue(`@otherJobCompanyInput`)
    contactsPage.section.editContactForm.setValue(`@otherJobCompanyInput`, contact.outlets[1].company)

    contactsPage.section.editContactForm.clearValue(`@emailInput`)
    contactsPage.section.editContactForm.setValue(`@emailInput`, contact.emails[0])

    contactsPage.section.editContactForm.waitForElementVisible('@addEmailButton')
    contactsPage.section.editContactForm.click(`@addEmailButton`)
    contactsPage.section.editContactForm.waitForElementVisible('@otherEmailInput')

    contactsPage.section.editContactForm.clearValue(`@otherEmailInput`)
    contactsPage.section.editContactForm.setValue(`@otherEmailInput`, contact.emails[1])

    contactsPage.section.editContactForm.clearValue(`@phoneInput`)
    contactsPage.section.editContactForm.setValue(`@phoneInput`, contact.phones[0])

    contactsPage.section.editContactForm.waitForElementVisible('@addPhoneButton')
    contactsPage.section.editContactForm.click(`@addPhoneButton`)
    contactsPage.section.editContactForm.waitForElementVisible('@otherPhoneInput')

    contactsPage.section.editContactForm.clearValue(`@otherPhoneInput`)
    contactsPage.section.editContactForm.setValue(`@otherPhoneInput`, contact.phones[1])

    contactsPage.section.editContactForm.waitForElementVisible('@addSocialButton')
    contactsPage.section.editContactForm.click(`@addSocialButton`)
    contactsPage.section.editContactForm.waitForElementVisible('@otherWebsiteInput')

    Object.keys(contact.socials).forEach(key => {
      contactsPage.section.editContactForm.clearValue(`@${key}Input`)
      contactsPage.section.editContactForm.setValue(`@${key}Input`, contact.socials[key])
    })

    contactsPage.section.editContactForm.click('@submitButton')

    t.perform(function (done) {
      t.db.findContact({
        name: contact.name
      })
      .then(function (doc) {
        t.assert.equal(doc.name, contact.name)

        t.assert.equal(doc.outlets.length, contact.outlets.length)

        doc.outlets.forEach((outlet, index) => {
          t.assert.equal(outlet.label, contact.outlets[index].company)
          t.assert.equal(outlet.value, contact.outlets[index].title)
        })

        const listProperties = ['emails', 'phones']

        listProperties.forEach(property => {
          t.assert.equal(doc[property].length, contact[property].length)

          contact[property].forEach((job, index) => {
            t.assert.equal(doc[property][index].value, contact[property][index])
          })
        })

        Object.keys(contact.socials).forEach((social, index) => {
          t.assert.equal(doc.socials[index].value, contact.socials[social])
        })

        done()
      })
      .catch(function (error) {
        console.info(error.stack)

        done()
      })
    })

    t.end()
  }
}

module.exports = test
