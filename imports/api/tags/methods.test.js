import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '../contacts/contacts'
import Tags from './tags'
import { batchAddTags, setTags } from './methods'

describe('Tags/batchAddTags', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => batchAddTags.run.call({}, {}), /You must be logged in/)
  })

  it('should validated the parameters', function () {
    assert.throws(() => batchAddTags.validate({}), /Type is required/)
    assert.doesNotThrow(() => batchAddTags.validate({type: 'Contacts', slugs: ['a'], names: ['hot']}))
  })

  it('should tag all contacts', function () {
    const contacts = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      name: `${index}`,
      slug: `${index}`,
      avatar: `${index}`,
      outlets: `${index}`,
      tags: []
    }))
    contacts.forEach((c) => Contacts.insert(c))
    Tags.insert({
      _id: '1',
      name: 'Hot',
      slug: 'hot',
      contactsCount: 1,
      campaignsCount: 99,
      users: {
        'alf': 1,
        'bob': 1
      },
      updatedAt: new Date()
    })

    const slugs = ['0', '1']
    const names = ['Hot', 'Cold']
    batchAddTags.run.call({userId: 'bob'}, {type: 'Contacts', slugs, names})

    assert.equal(Tags.find({}).count(), 2, '1 tag created and 1 tag updated')

    const hotTag = Tags.findOne({slug: 'hot'})
    delete hotTag.updatedAt
    assert.deepEqual(hotTag, {
      _id: '1',
      name: 'Hot',
      slug: 'hot',
      contactsCount: 3,
      campaignsCount: 99,
      users: {
        'alf': 1,
        'bob': 2
      }
    })

    const coldTag = Tags.findOne({slug: 'cold'})
    delete coldTag.updatedAt
    delete coldTag._id
    assert.deepEqual(coldTag, {
      name: 'Cold',
      slug: 'cold',
      contactsCount: 2,
      campaignsCount: 0,
      users: {
        'bob': 1
      }
    })

    Contacts.find({slug: { $in: slugs }}).forEach((c, i) => {
      const hotTag = c.tags.find((t) => t.slug === 'hot')
      assert.deepEqual(hotTag, {
        name: 'Hot',
        slug: 'hot',
        count: 3
      })
      const coldTag = c.tags.find((t) => t.slug === 'cold')
      assert.deepEqual(coldTag, {
        name: 'Cold',
        slug: 'cold',
        count: 2
      })
    })
  })
})

describe('Tags/set', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => setTags.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => setTags.validate({}), /Type is required/)
    assert.doesNotThrow(() => setTags.validate({type: 'Contacts', _id: 'ANMPNsiKdsnL3TEMa', tags: ['hot']}))
  })

  it('should tag a contact', function () {
    const contacts = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      name: `${index}`,
      slug: `${index}`,
      avatar: `${index}`,
      outlets: `${index}`,
      tags: []
    }))
    contacts.forEach((c) => Contacts.insert(c))
    Tags.insert({
      _id: '1',
      name: 'Hot',
      slug: 'hot',
      contactsCount: 1,
      campaignsCount: 99,
      users: {
        'alf': 1,
        'bob': 1
      },
      updatedAt: new Date()
    })

    const slugs = ['0', '1']
    const names = ['Hot', 'Cold']
    setTags.run.call({userId: 'bob'}, {type: 'Contacts', _id: contacts[0]._id, tags: names})

    assert.equal(Tags.find({}).count(), 2, '1 tag created and 1 tag updated')

    const hotTag = Tags.findOne({slug: 'hot'})
    delete hotTag.updatedAt
    assert.deepEqual(hotTag, {
      _id: '1',
      name: 'Hot',
      slug: 'hot',
      contactsCount: 2,
      campaignsCount: 99,
      users: {
        'alf': 1,
        'bob': 2
      }
    })

    const coldTag = Tags.findOne({slug: 'cold'})
    delete coldTag.updatedAt
    delete coldTag._id
    assert.deepEqual(coldTag, {
      name: 'Cold',
      slug: 'cold',
      contactsCount: 1,
      campaignsCount: 0,
      users: {
        'bob': 1
      }
    })

    const contact0 = Contacts.findOne({_id: contacts[0]._id})
    assert.deepEqual(contact0.tags.find((t) => t.slug === 'hot'), {
      name: 'Hot',
      slug: 'hot',
      count: 2
    })
    assert.deepEqual(contact0.tags.find((t) => t.slug === 'cold'), {
      name: 'Cold',
      slug: 'cold',
      count: 1
    })

    const contact1 = Contacts.findOne({_id: contacts[1]._id})
    assert.equal(0, contact1.tags.length)

    const contact2 = Contacts.findOne({_id: contacts[2]._id})
    assert.equal(0, contact2.tags.length)
  })
})
