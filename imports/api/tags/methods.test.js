import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import faker from 'faker'
import Contacts from '/imports/api/contacts/contacts'
import Tags from '/imports/api/tags/tags'
import { batchAddTags, setTags } from '/imports/api/tags/methods'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists } from '/tests/fixtures/server-domain'
import toUserRef from '/imports/lib/to-user-ref'

describe('Tags/batchAddTags', function () {
  let contacts = []

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(2)
    contacts = createTestContacts(3)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => batchAddTags.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => batchAddTags.validate({}), /Type is required/)
    assert.doesNotThrow(() => batchAddTags.validate({
      type: 'Contacts',
      slugs: [contacts[0].slug],
      names: ['hot']
    }))
  })

  it('should tag all contacts', function () {
    assert.equal(Tags.find({}).count(), 0, 'No tags')

    batchAddTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      slugs: [contacts[2].slug],
      names: [faker.lorem.word()]
    })

    assert.equal(Tags.find({}).count(), 1, '1 tag created')

    const existingTag = Tags.findOne()

    batchAddTags.run.call({
      userId: users[1]._id
    }, {
      type: 'Contacts',
      slugs: [contacts[0].slug, contacts[1].slug],
      names: [existingTag.name, 'Cold']
    })

    assert.equal(Tags.find({}).count(), 2, '1 tag created and 1 tag updated')

    const hotTag = Tags.findOne({slug: existingTag.slug})

    assert.deepEqual(hotTag, {
      _id: existingTag._id,
      name: existingTag.name,
      slug: existingTag.slug,
      contactsCount: existingTag.contactsCount + 2,
      campaignsCount: existingTag.campaignsCount,
      createdAt: existingTag.createdAt,
      createdBy: toUserRef(users[0])
    })

    const coldTag = Tags.findOne({slug: 'cold'})
    delete coldTag.createdAt
    delete coldTag._id

    assert.deepEqual(coldTag, {
      name: 'Cold',
      slug: 'cold',
      contactsCount: 2,
      campaignsCount: 0,
      createdBy: toUserRef(users[1])
    })

    Contacts.find({
      slug: {
        $in: [contacts[0].slug, contacts[1].slug]
      }
    }).forEach((c, i) => {
      const hotTag = c.tags.find((t) => t.slug === existingTag.slug)
      assert.deepEqual(hotTag, {
        _id: existingTag._id,
        name: existingTag.name,
        slug: existingTag.slug,
        count: 3
      })
      const coldTag = c.tags.find((t) => t.slug === 'cold')
      delete coldTag._id
      assert.deepEqual(coldTag, {
        name: 'Cold',
        slug: 'cold',
        count: 2
      })
    })
  })

  it('should not change updatedAt when batch tagging a contact', function () {
    const updatedAt = contacts[0].updatedAt

    batchAddTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      slugs: [contacts[0].slug],
      names: [faker.lorem.word()]
    })

    const contact = Contacts.findOne({_id: contacts[0]._id})

    assert.equal(updatedAt.getTime(), contact.updatedAt.getTime())
  })
})

describe('Tags/set', function () {
  let users
  let contacts
  let campaigns

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(2)
    contacts = createTestContacts(3)
    campaigns = createTestCampaigns(1)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => setTags.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => setTags.validate({}), /Type is required/)
    assert.doesNotThrow(() => setTags.validate({
      type: 'Contacts',
      _id: contacts[0]._id,
      tags: ['hot']
    }))
  })

  it('should tag a contact', function () {
    assert.equal(Tags.find({}).count(), 0, 'No tags')

    setTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      _id: contacts[0]._id,
      tags: [faker.lorem.word()]
    })

    assert.equal(Tags.find({}).count(), 1, '1 tag created')

    const existingTag = Tags.findOne()

    setTags.run.call({
      userId: users[1]._id
    }, {
      type: 'Contacts',
      _id: contacts[1]._id,
      tags: [existingTag.name, 'Cold']
    })

    assert.equal(Tags.find({}).count(), 2, '1 tag created and 1 tag updated')

    const hotTag = Tags.findOne({slug: existingTag.slug})

    assert.deepEqual(hotTag, {
      _id: existingTag._id,
      name: existingTag.name,
      slug: existingTag.slug,
      contactsCount: existingTag.contactsCount + 1,
      campaignsCount: existingTag.campaignsCount,
      createdAt: existingTag.createdAt,
      createdBy: toUserRef(users[0])
    })

    const coldTag = Tags.findOne({slug: 'cold'})
    delete coldTag.createdAt
    delete coldTag._id

    assert.deepEqual(coldTag, {
      name: 'Cold',
      slug: 'cold',
      contactsCount: 1,
      campaignsCount: 0,
      createdBy: toUserRef(users[1])
    })

    const contact1 = Contacts.findOne({_id: contacts[1]._id})
    assert.deepEqual(contact1.tags.find((t) => t.slug === existingTag.slug), {
      _id: existingTag._id,
      name: existingTag.name,
      slug: existingTag.slug,
      count: 2
    })
    const coldTag2 = contact1.tags.find((t) => t.slug === 'cold')
    delete coldTag2._id
    assert.deepEqual(coldTag2, {
      name: 'Cold',
      slug: 'cold',
      count: 1
    })

    const contact2 = Contacts.findOne({_id: contacts[2]._id})
    assert.equal(0, contact2.tags.length)
  })

  it('should update tag counts when removing tags from a contact', function () {
    setTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Campaigns',
      _id: campaigns[0]._id,
      tags: ['Hot']
    })
    setTags.run.call({
      userId: users[1]._id
    }, {
      type: 'Contacts',
      _id: contacts[0]._id,
      tags: ['Warm', 'Tepid']
    })

    // tags collections should have been updated
    assert.equal(Tags.findOne({slug: 'hot'}).contactsCount, 0)
    assert.equal(Tags.findOne({slug: 'hot'}).campaignsCount, 1)
    assert.equal(Tags.findOne({slug: 'warm'}).contactsCount, 1)
    assert.equal(Tags.findOne({slug: 'tepid'}).contactsCount, 1)

    // tags on contact should have been updated
    assert.equal(Contacts.findOne({_id: contacts[0]._id}).tags.find(t => t.slug === 'warm').count, 1)
    assert.equal(Contacts.findOne({_id: contacts[0]._id}).tags.find(t => t.slug === 'tepid').count, 1)

    setTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      _id: contacts[0]._id,
      tags: ['Hot', 'Cold']
    })

    // tags collections should have been updated
    assert.equal(Tags.findOne({slug: 'hot'}).contactsCount, 1)
    assert.equal(Tags.findOne({slug: 'hot'}).campaignsCount, 1)
    assert.equal(Tags.findOne({slug: 'cold'}).contactsCount, 1)
    assert.equal(Tags.findOne({slug: 'warm'}).contactsCount, 0)
    assert.equal(Tags.findOne({slug: 'tepid'}).contactsCount, 0)

    // tags on contact should have been updated
    assert.equal(Contacts.findOne({_id: contacts[0]._id}).tags.find(t => t.slug === 'hot').count, 1)
    assert.equal(Contacts.findOne({_id: contacts[0]._id}).tags.find(t => t.slug === 'cold').count, 1)

    setTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      _id: contacts[0]._id,
      tags: ['Hot']
    })

    // tags collections should have been updated
    assert.equal(Tags.findOne({slug: 'hot'}).contactsCount, 1)
    assert.equal(Tags.findOne({slug: 'hot'}).campaignsCount, 1)
    assert.equal(Tags.findOne({slug: 'cold'}).contactsCount, 0)
    assert.equal(Tags.findOne({slug: 'warm'}).contactsCount, 0)
    assert.equal(Tags.findOne({slug: 'tepid'}).contactsCount, 0)

    // tags on contact should have been updated
    assert.equal(Contacts.findOne({_id: contacts[0]._id}).tags.find(t => t.slug === 'hot').count, 1)

    // tag a different user
    setTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      _id: contacts[1]._id,
      tags: ['Hot']
    })

    // tags collections should have been updated
    assert.equal(Tags.findOne({slug: 'hot'}).contactsCount, 2)
    assert.equal(Tags.findOne({slug: 'hot'}).campaignsCount, 1)
    assert.equal(Tags.findOne({slug: 'cold'}).contactsCount, 0)
    assert.equal(Tags.findOne({slug: 'warm'}).contactsCount, 0)
    assert.equal(Tags.findOne({slug: 'tepid'}).contactsCount, 0)

    // tags on contacts should have been updated
    assert.equal(Contacts.findOne({_id: contacts[0]._id}).tags.find(t => t.slug === 'hot').count, 2)
    assert.equal(Contacts.findOne({_id: contacts[1]._id}).tags.find(t => t.slug === 'hot').count, 2)
  })

  it('should not change updatedAt when tagging a contact', function () {
    const updatedAt = contacts[0].updatedAt

    setTags.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      _id: contacts[0]._id,
      tags: [faker.lorem.word()]
    })

    const contact = Contacts.findOne({_id: contacts[0]._id})

    assert.equal(updatedAt.getTime(), contact.updatedAt.getTime())
  })
})
