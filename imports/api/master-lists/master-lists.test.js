import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import MasterLists from './master-lists'
import { batchAddToContactLists } from './methods'
import { createTestUsers, createTestContacts,createTestContactLists } from '/tests/fixtures/server-domain'
import toUserRef from '/imports/lib/to-user-ref'

describe('MasterLists.replaceContact', function () {
  let contacts = []
  let users = []
  let contactLists = []

  beforeEach(function () {
    resetDatabase()
    users = createTestUsers(1)
    contacts = createTestContacts(2)
    contactLists = createTestContactLists(4)
  })

  /*
    take 2 contacts and add them both to the same masterList.
    Then add each one to it's own masterList.

    alf: [1,2]
    bob: [1,3]

    we expect alf to end up in the union of the two, and bob to be in none.
    alf: [1,2,3]
    bob: []
  */
  it('should replace the contact', function () {

    batchAddToContactLists.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      contactSlugs: contacts.map(c => c.slug),
      masterListIds: [contactLists[0]._id]
    })

    batchAddToContactLists.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      contactSlugs: [contacts[0].slug],
      masterListIds: [contactLists[1]._id]
    })

    batchAddToContactLists.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      contactSlugs: [contacts[1].slug],
      masterListIds: [contactLists[2]._id]
    })

    const res = MasterLists.replaceContact(
      Contacts.findOne({_id: contacts[0]._id}),
      Contacts.findOne({_id: contacts[1]._id})
    )

    assert.equal(res.length, 3, '3 unique masterListRefs are returned')

    assert.deepEqual(MasterLists.findOne({_id: contactLists[0]._id}).items, [contacts[0]._id], 'MasterList 0 contains just the incoming contact')
    assert.deepEqual(MasterLists.findOne({_id: contactLists[1]._id}).items, [contacts[0]._id], 'MasterList 1 contains just the incoming contact')
    assert.deepEqual(MasterLists.findOne({_id: contactLists[2]._id}).items, [contacts[0]._id], 'MasterList 2 contains just the incoming contact')
    assert.deepEqual(MasterLists.findOne({_id: contactLists[3]._id}).items, [], 'MasterList 3 remains empty')
  })
})