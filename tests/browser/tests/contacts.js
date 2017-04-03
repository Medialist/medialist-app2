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

    t.page.main().logout()

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

    const form = contactsPage.section.editContactForm

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

    t.page.main().logout()

    t.end()
  }
}

module.exports = test
