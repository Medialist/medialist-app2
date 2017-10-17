import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import MasterLists from './master-lists'
import { batchAddToContactLists } from './methods'
import { createTestUsers, createTestContacts,createTestContactLists } from '/tests/fixtures/server-domain'
import toUserRef from '/imports/lib/to-user-ref'

describe.only('MasterLists.replaceContact', function () {
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
    Take 2 contacts and add them both to the same masterList.
    Then add each one to it's own masterList.

    listA: [0, 1]
    listB: [0]
    listC: [1]
    listD: []

    Then replace contact 1 with contact 0

    listA: [0]
    listB: [0]
    listC: [0]
    listD: []

    We expect all reference to contact 1 to have been replaced with contact 1,
    and no duplicates where both were on the same list.

    Other lists should be unaffected.
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