import assert from 'assert'
import Faker from 'faker'
import isEqual from 'lodash.isequal'
import { Random } from 'meteor/random'
import {
  create,
  del,
  update,
  addItems,
  removeItem,
  itemCount,
  typeCount,
  setMasterLists,
  batchAddToMasterLists
  } from './methods'
import MasterLists from './master-lists'
import Contacts from '../contacts/contacts'
import Campaigns from '../campaigns/campaigns'
import { resetDatabase } from 'meteor/xolvio:cleaner'

describe('batchAddToMasterLists', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should validate the parameters', function () {
    assert.throws(() => {
      batchAddToMasterLists.validate({ type: 'Suprise', slugs: ['alf'], masterListIds: ['1'] })
    })
    assert.throws(() => {
      batchAddToMasterLists.validate({ type: 'Contacts', masterListIds: ['1'] })
    })
    assert.throws(() => {
      batchAddToMasterLists.validate({ type: 'Contacts', slugs: ['alf'], masterListIds: 'fish' })
    })
    assert.doesNotThrow(() => {
      batchAddToMasterLists.validate({ type: 'Contacts', slugs: ['alf'], masterListIds: ['WLdYNs95DmFuHfu6v'] })
    })
  })

  it('should add all contacts to all Contact Lists', function () {
    const contacts = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      masterLists: []
    }))
    contacts.forEach((c) => Contacts.insert(c))

    const masterLists = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      name: `${index}`,
      slug: `${index}`,
      order: `${index}`,
      items: []
    }))
    masterLists.forEach((c) => MasterLists.insert(c))

    const slugs = ['0', '1']
    const masterListIds = ['1', '2']
    batchAddToMasterLists.run.call(
      { userId: 'alf' },
      { type: 'Contacts', slugs, masterListIds }
    )

    Contacts.find({slug: { $in: slugs }}).forEach((c) => {
      assert.deepEqual(
        c.masterLists[0],
        { _id: '1', name: '1', slug: '1' }
      )
      assert.deepEqual(
        c.masterLists[1],
        { _id: '2', name: '2', slug: '2' }
      )
    })

    MasterLists.find({_id: { $in: masterListIds }}).forEach((c) => {
      assert.deepEqual(c.items[0], '0')
      assert.deepEqual(c.items[1], '1')
    })
  })
})

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
    assert.throws(() => del.run({ _ids: [masterListId] }), /You must be logged in/)
  })

  it('should allow the deletion of a existing MasterList', function () {
    del.run.call({ userId: 123 }, { _ids: [masterListId] })
    const masterList = MasterLists.findOne(masterListId)
    assert.strictEqual(masterList, undefined)
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
    Campaigns.insert({ masterLists: [{ _id: masterListId }] })
  })

  it('should not allow a MasterList update unless logged in', function () {
    assert.throws(() => update.run.call({}, { _id: masterListId, name: Faker.company.companyName() }), /You must be logged in/)
  })

  it('should not allow an update to a non-existent MasterList', function () {
    assert.throws(() => update.run.call({ userId: 123 }, { _id: Random.id(), name: Faker.company.companyName() }), /MasterList not found/)
  })

  it('should not allow an update to a MasterList field other than name', function () {
    assert.throws(() => update.validate.call({ userId: 123 }, { _id: masterListId, slug: Faker.commerce.productMaterial() }), /slug is not allowed by the schema/)
  })

  it('should correctly update an existing MasterList', function () {
    const newName = Faker.company.companyName()
    update.run.call({ userId: 123 }, { _id: masterListId, name: newName })
    const masterList = MasterLists.findOne({ _id: masterListId })
    assert.equal(masterList.name, newName)
    const campaign = Campaigns.findOne()
    assert.equal(campaign.masterLists[0].name, newName)
  })
})

describe('master-lists-addItems', function () {
  let masterListId, campaigns, contact

  beforeEach(function () {
    resetDatabase()
    campaigns = Array(3).fill(0).map(() => {
      const campaign = { name: Faker.company.companyName(), slug: Faker.commerce.productMaterial(), masterLists: [] }
      const _id = Campaigns.insert({ name: Faker.company.companyName(), slug: Faker.commerce.productMaterial(), masterLists: [] })
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

  it('should not allow items to be added to a MasterList unless logged in', function () {
    assert.throws(() => addItems.run.call({}, { _id: masterListId, items: campaigns.map((c) => c._id) }), /You must be logged in/)
  })

  it('should not allow items to be added to a non-existent MasterList', function () {
    assert.throws(() => addItems.run.call({ userId: 123 }, { _id: Random.id(), items: campaigns.map((c) => c._id) }), /MasterList not found/)
  })

  it('should not allow items of the wrong type to be added to a MasterList', function () {
    assert.throws(() => addItems.run.call({ userId: 123 }, { _id: masterListId, items: [contact._id] }), /One or more items does not exist in the correct collection for this masterlist/)
  })

  it('should correctly add items to an existing MasterList without duplication', function () {
    addItems.run.call({ userId: 123 }, { _id: masterListId, items: campaigns.map((c) => c._id) })
    const masterList = MasterLists.findOne({ _id: masterListId })
    assert.equal(masterList.items.length, 3)
    const addedCampaign = Campaigns.findOne()
    assert.equal(addedCampaign.masterLists[0]._id, masterListId)
  })
})

describe('master-lists-removeItem', function () {
  let masterListId, campaigns, contact

  beforeEach(function () {
    resetDatabase()
    campaigns = Array(3).fill(0).map(() => {
      const campaign = { name: Faker.company.companyName(), slug: Faker.commerce.productMaterial(), masterLists: [] }
      const _id = Campaigns.insert({ name: Faker.company.companyName(), slug: Faker.commerce.productMaterial(), masterLists: [] })
      return { _id, ...campaign }
    })
    contact = { name: Faker.name.findName(), slug: Faker.commerce.productMaterial(), masterLists: [] }
    const contactId = Contacts.insert(contact)
    Object.assign(contact, { _id: contactId })
    masterListId = MasterLists.insert({
      type: 'Campaigns',
      name: Faker.company.companyName(),
      slug: Faker.commerce.productMaterial(),
      items: campaigns.map((c) => c._id),
      order: 0
    })
    Campaigns.update({ _id: campaigns[0]._id }, { $set: { masterLists: [{ _id: masterListId }] } })
  })

  it('should not allow an item to be removed from a MasterList unless logged in', function () {
    assert.throws(() => removeItem.run.call({}, { _id: masterListId, item: campaigns[0]._id }), /You must be logged in/)
  })

  it('should not allow item to be removed from a non-existent MasterList', function () {
    assert.throws(() => removeItem.run.call({ userId: 123 }, { _id: Random.id(), item: campaigns[0]._id }), /MasterList not found/)
  })

  it('should not allow item of the wrong type to be removed from a MasterList', function () {
    assert.throws(() => removeItem.run.call({ userId: 123 }, { _id: masterListId, items: [contact._id] }), /MasterList not found/)
  })

  it('should correctly remove item from an existing MasterList', function () {
    removeItem.run.call({ userId: 123 }, { _id: masterListId, item: campaigns[0]._id })
    const masterList = MasterLists.findOne({ _id: masterListId })
    assert.equal(masterList.items.length, 2)
    const removedCampaign = Campaigns.findOne({ _id: campaigns[0]._id })
    assert.equal(removedCampaign.masterLists.length, 0)
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
    assert.throws(() => itemCount.run.call({}, [masterListId]), /You must be logged in/)
  })

  it('should return no results for a non-existent MasterList', function () {
    const res = itemCount.run.call({ userId: 123 }, [Random.id()])
    assert(isEqual(res, {}))
  })

  it('should correctly retrive the item count for an existing MasterList', function () {
    const res = itemCount.run.call({ userId: 123 }, [masterListId])
    assert(isEqual(res, { [masterListId]: 3 }))
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
    assert.throws(() => typeCount.run.call(), /You must be logged in/)
  })

  it('should correctly retrive the type count for a logged-in user', function () {
    const typeCounts = typeCount.run.call({ userId: 123 })
    assert(isEqual(typeCounts, [
      { _id: 'Campaigns', count: 2 },
      { _id: 'Contacts', count: 1 }
    ]))
  })
})

describe('master-lists-set-masterlists', function () {
  let masterListIds, masterlists, campaigns, contact

  beforeEach(function () {
    resetDatabase()
    masterlists = Array(3).fill(0).map(() => {
      const masterlist = {
        type: 'Campaigns',
        name: Faker.company.companyName(),
        slug: Faker.commerce.productMaterial(),
        items: [],
        order: 0
      }
      const _id = MasterLists.insert(masterlist)
      return { _id, ...masterlists }
    })
    masterListIds = masterlists.map((m) => m._id)
    campaigns = Array(1).fill(0).map(() => {
      const campaign = { name: Faker.company.companyName(), slug: Faker.commerce.productMaterial(), masterLists: [] }
      const _id = Campaigns.insert({ name: Faker.company.companyName(), slug: Faker.commerce.productMaterial(), masterLists: [] })
      return { _id, ...campaign }
    })
  })

  it('should require a logged in user', function () {
    assert.throws(() => setMasterLists.run.call({}, { type: 'Campaigns', item: campaigns[0]._id, masterLists: masterListIds }, /You must be logged in/))
  })

  it('should validate its parameters', function () {
    assert.doesNotThrow(() => {
      setMasterLists.validate({ type: 'Campaigns', item: campaigns[0]._id, masterLists: masterListIds })
    })
    assert.throws(() => {
      setMasterLists.validate({ type: 'Test', item: campaigns[0]._id, masterLists: masterListIds }, /Test is not an allowed value/)
    })
  })

  it('should set a new masterlist on a campaign', function () {
    const itemId = campaigns[0]._id
    setMasterLists.run.call({userId: 123}, { type: 'Campaigns', item: itemId, masterLists: masterListIds })
    const upatedCampaign = Campaigns.findOne({_id: itemId})
    assert.equal(upatedCampaign.masterLists.length, 3, 'campaign has 3 masterlists')
    const updatedMasterLists = MasterLists.find({items: {$in: [itemId]}})
    assert.equal(updatedMasterLists.count(), 3, '3 masterlists have been updated')
  })

  it('should update masterlists removing and adding as approprate', function () {
    const campaignId = campaigns[0]._id
    // add item to two masterlists
    setMasterLists.run.call({userId: 123}, { type: 'Campaigns', item: campaignId, masterLists: [masterListIds[0], masterListIds[1]] })
    const campaign = Campaigns.findOne({_id: campaignId})
    assert.equal(campaign.masterLists.indexOf(masterListIds[2]), -1, 'campaign is not added to a masterlist if it is not specified')
    assert.ok(campaign.masterLists.find(list => list._id === masterListIds[0]), 'campaign is added to all masterlists that are specified')
    assert.ok(campaign.masterLists.find(list => list._id === masterListIds[1]), 'campaign is added to all masterlists that are specified')
    const masterLists = MasterLists.find({items: {$size: 1}}).fetch()
    assert.equal(masterLists.length, 2, '2 masterLists records have an the same item inserted')
    // update the item removing from one masterlist and adding to another
    setMasterLists.run.call({userId: 123}, { type: 'Campaigns', item: campaignId, masterLists: [masterListIds[0], masterListIds[2]] })
    const removedMasterList = MasterLists.findOne({_id: masterListIds[1]})
    assert.equal(removedMasterList.items.length, 0, 'itemId has been removed successfully')
    const addedMasterList = MasterLists.findOne({_id: masterListIds[2]})
    assert.equal(addedMasterList.items[0], campaignId, 'item has been added successfully')
  })

})
