import assert from 'assert'
import Faker from 'faker'
import isEqual from 'lodash.isequal'
import { Random } from 'meteor/random'
import { create, del, update, addItems, itemCount, typeCount } from './methods'
import MasterLists from './master-lists'
import Contacts from '../contacts/contacts'
import Medialists from '../medialists/medialists'
import { resetDatabase } from 'meteor/xolvio:cleaner'

describe('master-lists-create', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should fail if type or name is missing', function () {
    assert.throws(() => {
      create.validate({ name: 'Hello' })
    })
    assert.throws(() => {
      create.validate({ type: 'Contacts' })
    })
  })

  it('should fail if type is invalid', function () {
    assert.throws(() => {
      create.validate({ name: 'Hello', type: 'Dogs' })
    })
  })

  it('should fail if type is invalid', function () {
    assert.throws(() => {
      create.validate({ name: 'Hello', type: 'Dogs' })
    })
  })

  it('should succeed if name and type are valid', function () {
    assert.doesNotThrow(() => {
      create.validate({ name: 'Hello', type: 'Contacts' })
    })
  })

  it('If all is well it should create a new master-list', function () {
    const id = create.run.call(
      { userId: '123' },
      { name: 'Hello', type: 'Contacts' }
    )
    assert.ok(id)
    const list = MasterLists.findOne(id)
    assert.equal(list.slug, 'hello')
    assert.equal(list.name, 'Hello')
    assert.equal(list.type, 'Contacts')
    assert.equal(list.order, 0)
  })
})

describe('master-lists-delete', function () {
  let masterListId

  beforeEach(function () {
    resetDatabase()
    masterListId = MasterLists.insert({
      type: 'Contacts',
      name: Faker.company.companyName(),
      slug: Faker.commerce.productMaterial(),
      items: [],
      order: 0
    })
    Contacts.insert({ masterLists: [{ _id: masterListId }] })
  })

  it('should not allow the deletion of an existing MasterList unless logged in', function () {
    assert.throws(() => del.run(masterListId))
  })

  it('should not allow the deletion of a non-existent MasterList', function () {
    assert.throws(() => del.run.call({ userId: 123 }, Random.id()))
  })

  it('should not allow the deletion of an already deleted MasterList', function () {
    MasterLists.update({}, { $set: { deleted: new Date() } })
    assert.throws(() => del.run.call({ userId: 123 }, masterListId))
  })

  it('should allow the deletion of an existing MasterList', function () {
    del.run.call({ userId: 123 }, masterListId)
    const masterList = MasterLists.findOne(masterListId)
    assert.ok(masterList)
    assert.ok(masterList.deleted)
    assert.strictEqual(Contacts.findOne({ 'masterLists._id': masterListId }), undefined)
  })
})

describe('master-lists-update', function () {
  let masterListId

  beforeEach(function () {
    resetDatabase()
    masterListId = MasterLists.insert({
      type: 'Campaigns',
      name: Faker.company.companyName(),
      slug: Faker.commerce.productMaterial(),
      items: Array(3).fill(0).map(() => Random.id()),
      order: 0
    })
    Medialists.insert({ masterLists: [{ _id: masterListId }] })
  })

  it('should not allow a MasterList update unless logged in', function () {
    assert.throws(() => update.run.call({}, { _id: masterListId, name: Faker.company.companyName() }))
  })

  it('should not allow an update to a non-existent MasterList', function () {
    assert.throws(() => update.run.call({ userId: 123 }, { _id: Random.Id(), name: Faker.company.companyName() }))
  })

  it('should not allow an update to a MasterList field other than name', function () {
    assert.throws(() => update.run.call({ userId: 123 }, { _id: Random.Id(), slug: Faker.commerce.productMaterial() }))
  })

  it('should correctly update an existing MasterList', function () {
    const newName = Faker.company.companyName()
    update.run.call({ userId: 123 }, { _id: masterListId, name: newName })
    const masterList = MasterLists.findOne({ _id: masterListId })
    assert.equal(masterList.name, newName)
    const medialist = Medialists.findOne()
    assert.equal(medialist.masterLists[0].name, newName)
  })
})

describe('master-lists-addItems', function () {
  let masterListId, campaigns, contact

  beforeEach(function () {
    resetDatabase()
    campaigns = Array(3).fill(0).map(() => {
      const campaign = { name: Faker.company.companyName(), slug: Faker.commerce.productMaterial(), masterLists: [] }
      const _id = Medialists.insert({ name: Faker.company.companyName(), slug: Faker.commerce.productMaterial(), masterLists: [] })
      return { _id, ...campaign }
    })
    contact = { name: Faker.name.findName(), slug: Faker.commerce.productMaterial(), masterLists: [] }
    const contactId = Contacts.insert(contact)
    Object.assign(contact, { _id: contactId })
    masterListId = MasterLists.insert({
      type: 'Campaigns',
      name: Faker.company.companyName(),
      slug: Faker.commerce.productMaterial(),
      items: [campaigns[0]._id],
      order: 0
    })
  })

  it('should not allow a items to be added to a MasterList unless logged in', function () {
    assert.throws(() => addItems.run.call({}, { _id: masterListId, items: campaigns.map((c) => c._id) }))
  })

  it('should not allow items to be added to a non-existent MasterList', function () {
    assert.throws(() => addItems.run.call({ userId: 123 }, { _id: Random.id(), items: campaigns.map((c) => c._id) }))
  })

  it('should not allow items of the wrong type to be added to a MasterList', function () {
    assert.throws(() => addItems.run.call({ userId: 123 }, { _id: masterListId, items: [contact._id] }))
  })

  it('should correctly add items to an existing MasterList without duplication', function () {
    addItems.run.call({ userId: 123 }, { _id: masterListId, items: campaigns.map((c) => c._id) })
    const masterList = MasterLists.findOne({ _id: masterListId })
    assert.equal(masterList.items.length, 3)
    const addedCampaign = Medialists.findOne()
    assert.equal(addedCampaign.masterLists[0]._id, masterListId)
  })
})

describe('master-lists-itemCount', function () {
  let masterListId

  beforeEach(function () {
    resetDatabase()
    masterListId = MasterLists.insert({
      type: Faker.random.arrayElement(['Contacts', 'Campaigns']),
      name: Faker.company.companyName(),
      slug: Faker.commerce.productMaterial(),
      items: Array(3).fill(0).map(() => Random.id()),
      order: 0
    })
  })

  it('should not allow the retrieval of a MasterList item count unless logged in', function () {
    assert.throws(() => itemCount.run.call({}, masterListId))
  })

  it('should not allow the retrieval of an item count for a non-existent MasterList', function () {
    assert.throws(() => itemCount.run.call({ userId: 123 }, Random.id()))
  })

  it('should correctly retrive the item count for an existing MasterList', function () {
    const count = itemCount.run.call({ userId: 123 }, masterListId)
    assert.equal(count, 3)
  })
})

describe('master-lists-typeCount', function () {
  beforeEach(function () {
    resetDatabase()
    ;['Campaigns', 'Campaigns', 'Contacts'].forEach((type) => MasterLists.insert({
      type,
      name: Faker.company.companyName(),
      slug: Faker.commerce.productMaterial(),
      items: Array(3).fill(0).map(() => Random.id()),
      order: 0
    }))
  })

  it('should not allow the retrieval of MasterList type count unless logged in', function () {
    assert.throws(() => typeCount.run.call())
  })

  it('should correctly retrive the type count for a logged-in user', function () {
    const typeCounts = typeCount.run.call({ userId: 123 })
    assert(isEqual(typeCounts, [
      { _id: 'Campaigns', count: 2 },
      { _id: 'Contacts', count: 1 }
    ]))
  })
})
