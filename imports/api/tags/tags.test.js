import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import Tags from '/imports/api/tags/tags'
import { batchAddTags } from './methods'
import { createTestUsers, createTestContacts } from '/tests/fixtures/server-domain'
import toUserRef from '/imports/lib/to-user-ref'

describe('Tags.replaceContact', function () {
  let contacts = []

  beforeEach(function () {
    resetDatabase()
    users = createTestUsers(1)
    contacts = createTestContacts(2)
  })

  it('should replace the contact', function () {

    batchAddTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      slugs: contacts.map(c => c.slug),
      names: ['dupe']
    })

    batchAddTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      slugs: [contacts[0].slug],
      names: ['a']
    })

    batchAddTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      slugs: [contacts[1].slug],
      names: ['b']
    })

    const mergedTags = Tags.replaceContact(
      Contacts.findOne({_id: contacts[0]._id}),
      Contacts.findOne({_id: contacts[1]._id})
    )

    assert.equal(mergedTags.length, 3, '3 unique tagRefs are returned')

    assert.equal(Tags.findOne({slug: 'dupe'}).contactsCount, 1, 'Tags on both contacts have had their count decrimented by 1')
    assert.equal(Tags.findOne({slug: 'a'}).contactsCount, 1, 'Tags on either contact haven\'t has their count changed.')
    assert.equal(Tags.findOne({slug: 'b'}).contactsCount, 1, 'Tags on either contact haven\'t has their count changed.')
  })
})