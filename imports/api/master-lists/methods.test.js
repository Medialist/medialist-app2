import assert from 'assert'
import Faker from 'faker'
import isEqual from 'lodash.isequal'
import { Random } from 'meteor/random'
import { create, del, itemCount, typeCount } from './methods'
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
      type: Faker.random.arrayElement(['Contacts', 'Campaigns']),
      name: Faker.company.companyName(),
      slug: Faker.commerce.productMaterial(),
      items: [],
      order: 0
    })
    Contacts.insert({ masterLists: [{ _id: masterListId }] })
    Medialists.insert({ masterLists: [{ _id: masterListId }] })
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
    assert.strictEqual(Medialists.findOne({ 'masterLists._id': masterListId }), undefined)
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
