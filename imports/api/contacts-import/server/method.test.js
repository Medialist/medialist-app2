import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import ContactsImport from '/imports/api/contacts-import/contacts-import'
import { importContacts } from './methods'
import { createContact } from '/imports/api/contacts/methods'
import { contact } from '../../../../tests/browser/fixtures/domain'
import { createTestUsers } from '/tests/fixtures/server-domain'

let userId = null

describe('importContacts', function () {
  this.timeout(30000)

  beforeEach(function () {
    resetDatabase()
    userId = createTestUsers(1)[0]._id
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => importContacts.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => importContacts.validate({datax: []}), /datax is not allowed/)
    assert.throws(() => importContacts.validate({data: [{name: 'Bob'}]}), /Outlets is required/)
    assert.doesNotThrow(() => importContacts.validate({data:[contact()]}))
  })

  it('should create all contacts', function (done) {
    const contactsToImport = Array(10).fill(0).map(contact)

    const _id = importContacts.run.call({userId}, {data: contactsToImport})

    const observer = ContactsImport.find({_id}).observeChanges({
      changed: function (id, fields) {
        const {results} = fields

        if (!results || !results.created) {
          return
        }

        if (results.created.length !== contactsToImport.length) {
          return
        }

        done()
      }
    })
  })

  it('should merge contacts', function (done) {
    const contactsToImport = Array(10).fill(0).map(contact)
    contactsToImport.forEach((c) => createContact.run.call({userId}, {details: c}))

    const _id = importContacts.run.call({userId}, {data: contactsToImport})

    const observer = ContactsImport.find({_id}).observeChanges({
      changed: function (id, fields) {
        const {results} = fields

        if (!results || !results.updated) {
          return
        }

        if (results.updated.length !== contactsToImport.length) {
          return
        }

        done()
      }
    })
  })
})
