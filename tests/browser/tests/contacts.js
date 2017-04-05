'use strict'

const faker = require('faker')
const tmp = require('tmp')
const fs = require('fs')

const test = {
  '@tags': ['contacts'],

  beforeEach: (t) => {
    t.resizeWindow(1440, 1024)

    t.page.authenticate()
      .register()
  },

  'Should import contacts': function (t) {
    const file = tmp.fileSync()
    const contents = `Name, Email, Telephone
${faker.name.findName()}, ${faker.internet.email()}, ${faker.phone.phoneNumber()}`
    fs.writeFileSync(file.fd, contents)

    const contactsPage = t.page.main()
      .navigateToContacts(t)
      .uploadCsvFile(file.name)
      .completeImport()

    contactsPage.section.importComplete.waitForElementVisible('@status')
    contactsPage.section.importComplete.assert.containsText('@status', 'Created 1 contacts and updated 0 contacts.')

    t.page.main().logout()
    t.end()
  },

  'Should create a new contact': function (t) {
    const contact = createContact()

    t.page.main()
      .navigateToContacts(t)
      .waitForElementVisible('@newContactButton')
      .createContact(contact)

    t.perform(function (done) {
      t.db.findContact({
        name: contact.name
      })
      .then(function (doc) {
        verifySame(t, contact, doc)

        done()
      })
      .catch(function (error) {
        console.info(error.stack)

        done()
      })
    })

    t.page.main().logout()
    t.end()
  },

  'Should edit an existing contact': function (t) {
    const contact = createContact()
    const updated = createContact()

    t.page.main()
      .navigateToContacts(t)
      .waitForElementVisible('@newContactButton')
      .createContact(contact)

    t.page.main()
      .navigateToContacts(t)
      .searchForContact(contact.name)
      .selectSearchResult(contact.name)
      .editContact()
      .verifyEditFormContents(contact)
      .updateContact(updated)

    t.perform(function (done) {
      t.db.findContact({
        name: updated.name
      })
      .then(function (doc) {
        verifySame(t, updated, doc)

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

const createContact = () => {
  return {
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
}

const verifySame = (t, contact, other) => {
  t.assert.equal(other.name, contact.name)

  t.assert.equal(other.outlets.length, contact.outlets.length)

  other.outlets.forEach((outlet, index) => {
    t.assert.equal(outlet.label, contact.outlets[index].company)
    t.assert.equal(outlet.value, contact.outlets[index].title)
  })

  const listProperties = ['emails', 'phones']

  listProperties.forEach(property => {
    t.assert.equal(other[property].length, contact[property].length)

    contact[property].forEach((job, index) => {
      t.assert.equal(other[property][index].value, contact[property][index])
    })
  })

  Object.keys(contact.socials).forEach((social, index) => {
    t.assert.equal(other.socials[index].value, contact.socials[social])
  })
}

module.exports = test
