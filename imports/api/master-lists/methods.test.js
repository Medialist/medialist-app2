import assert from 'assert'
import faker from 'faker'
import isEqual from 'lodash.isequal'
import { Random } from 'meteor/random'
import {
  createMasterList,
  removeMasterList,
  updateMasterList,
  addItemsToMasterList,
  removeItemFromMasterList,
  masterListItemCount,
  masterListTypeCount,
  setMasterLists,
  batchAddToMasterLists
  } from './methods'
import MasterLists from '/imports/api/master-lists/master-lists'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import { campaign, user, contact } from '/tests/browser/fixtures/domain'
import { createContact } from '/imports/api/contacts/methods'
import { createCampaign } from '/imports/api/campaigns/methods'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists } from '/tests/fixtures/server-domain'

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
    const users = createTestUsers(2)
    const contacts = createTestContacts(3)
    const contactLists = createTestContactLists(2)

    batchAddToMasterLists.run.call({
      userId: 'alf'
    }, {
      type: 'Contacts',
      slugs: [contacts[0].slug, contacts[1].slug],
      masterListIds: [contactLists[0]._id, contactLists[1]._id]
    })

    Contacts.find({
      slug: {
        $in: [contacts[0].slug, contacts[1].slug]
      }
    }).forEach((c) => {
      assert.deepEqual(
        c.masterLists.find(list => list._id === contactLists[0]._id), {
          _id: contactLists[0]._id,
          name: contactLists[0].name,
          slug: contactLists[0].slug
        }
      )
      assert.deepEqual(
        c.masterLists.find(list => list._id === contactLists[1]._id), {
          _id: contactLists[1]._id,
          name: contactLists[1].name,
          slug: contactLists[1].slug
        }
      )
    })

    MasterLists.find({
      _id: {
        $in: [contactLists[0]._id, contactLists[1]._id]
      }
    }).forEach((c) => {
      assert.equal(c.items.length, 2)
      assert.ok(c.items.find(_id => _id === contacts[0]._id))
      assert.ok(c.items.find(_id => _id === contacts[1]._id))
    })
  })
})

describe('master-lists-create', function () {
  let userId

  beforeEach(function () {
    resetDatabase()

    userId = createTestUsers(1)[0]._id
  })

  it('should fail if type or name is missing', function () {
    assert.throws(() => {
      createMasterList.validate({ name: 'Hello' })
    })
    assert.throws(() => {
      createMasterList.validate({ type: 'Contacts' })
    })
  })

  it('should fail if type is invalid', function () {
    assert.throws(() => {
      createMasterList.validate({ name: 'Hello', type: 'Dogs' })
    })
  })

  it('should fail if type is invalid', function () {
    assert.throws(() => {
      createMasterList.validate({ name: 'Hello', type: 'Dogs' })
    })
  })

  it('should succeed if name and type are valid', function () {
    assert.doesNotThrow(() => {
      createMasterList.validate({ name: 'Hello', type: 'Contacts' })
    })
  })

  it('If all is well it should create a new master-list', function () {
    const id = createMasterList.run.call({
      userId: userId
    }, {
      name: 'Hello',
      type: 'Contacts'
    })
    assert.ok(id)
    const list = MasterLists.findOne(id)
    assert.equal(list.slug, 'hello')
    assert.equal(list.name, 'Hello')
    assert.equal(list.type, 'Contacts')
    assert.equal(list.order, 0)
  })
})

describe('master-lists-delete', function () {
  let users
  let contacts
  let contactLists

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(2)
    contacts = createTestContacts(1)
    contactLists = createTestContactLists(1)

    batchAddToMasterLists.run.call({
      userId: users[0]._id
    }, {
      type: 'Contacts',
      slugs: [contacts[0].slug],
      masterListIds: [contactLists[0]._id]
    })
  })

  it('should not allow the deletion of an existing MasterList unless logged in', function () {
    assert.throws(() => removeMasterList.run({ _ids: [contactLists[0]._id] }), /You must be logged in/)
  })

  it('should allow the deletion of a existing MasterList', function () {
    removeMasterList.run.call({ userId: 123 }, { _ids: [contactLists[0]._id] })
    const masterList = MasterLists.findOne(contactLists[0]._id)
    assert.strictEqual(masterList, undefined)
    assert.strictEqual(Contacts.findOne({ 'masterLists._id': contactLists[0]._id }), undefined)
  })
})

describe('master-lists-update', function () {
  let users
  let campaigns
  let masterLists

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(2)
    campaigns = createTestCampaigns(1)
    masterLists = createTestCampaignLists(1)

    batchAddToMasterLists.run.call({
      userId: users[0]._id
    }, {
      type: 'Campaigns',
      slugs: [campaigns[0].slug],
      masterListIds: [masterLists[0]._id]
    })
  })

  it('should not allow a MasterList update unless logged in', function () {
    assert.throws(() => updateMasterList.run.call({}, { _id: masterLists[0]._id, name: faker.company.companyName() }), /You must be logged in/)
  })

  it('should not allow an update to a non-existent MasterList', function () {
    assert.throws(() => updateMasterList.run.call({ userId: users[1]._id }, { _id: Random.id(), name: faker.company.companyName() }), /MasterList not found/)
  })

  it('should not allow an update to a MasterList field other than name', function () {
    assert.throws(() => updateMasterList.validate.call({ userId: users[1]._id }, { _id: masterLists[0]._id, slug: faker.commerce.productMaterial() }), /slug is not allowed by the schema/)
  })

  it('should correctly update an existing MasterList', function () {
    const newName = faker.company.companyName()
    updateMasterList.run.call({ userId: users[1]._id }, { _id: masterLists[0]._id, name: newName })
    const masterList = MasterLists.findOne({ _id: masterLists[0]._id })
    assert.equal(masterList.name, newName)
    const campaign = Campaigns.findOne()
    assert.equal(campaign.masterLists[0].name, newName)
  })
})

describe('master-lists-set-masterlists', function () {
  let users
  let campaigns
  let contacts
  let masterLists

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(2)
    masterLists = createTestCampaignLists(3)
    campaigns = createTestCampaigns(1)
  })

  it('should require a logged in user', function () {
    assert.throws(() => setMasterLists.run.call({}, { type: 'Campaigns', item: campaigns[0]._id, masterLists: masterLists.map(m => m._id) }, /You must be logged in/))
  })

  it('should validate its parameters', function () {
    assert.doesNotThrow(() => {
      setMasterLists.validate({
        type: 'Campaigns',
        item: campaigns[0]._id,
        masterLists: masterLists.map(m => m._id)
      })
    })
    assert.throws(() => {
      setMasterLists.validate({
        type: 'Test',
        item: campaigns[0]._id,
        masterLists: masterLists.map(m => m._id)
      }, /Test is not an allowed value/)
    })
  })

  it('should set a new masterlist on a campaign', function () {
    const itemId = campaigns[0]._id
    setMasterLists.run.call({userId: users[1]._id}, { type: 'Campaigns', item: itemId, masterLists: masterLists.map(m => m._id) })
    const upatedCampaign = Campaigns.findOne({_id: itemId})
    assert.equal(upatedCampaign.masterLists.length, 3, 'campaign has 3 masterlists')
    const updatedMasterLists = MasterLists.find({items: {$in: [itemId]}})
    assert.equal(updatedMasterLists.count(), 3, '3 masterlists have been updated')
  })

  it('should update masterlists removing and adding as approprate', function () {
    const campaignId = campaigns[0]._id

    // add item to two masterlists
    setMasterLists.run.call({userId: users[1]._id}, { type: 'Campaigns', item: campaignId, masterLists: [masterLists[0]._id, masterLists[1]._id] })

    const campaign = Campaigns.findOne({_id: campaignId})
    assert.equal(campaign.masterLists.indexOf(masterLists[2]._id), -1, 'campaign is not added to a masterlist if it is not specified')
    assert.ok(campaign.masterLists.find(list => list._id === masterLists[0]._id), 'campaign is added to all masterlists that are specified')
    assert.ok(campaign.masterLists.find(list => list._id === masterLists[1]._id), 'campaign is added to all masterlists that are specified')

    const lists = MasterLists.find({items: {$size: 1}}).fetch()
    assert.equal(lists.length, 2, '2 masterLists records have an the same item inserted')
    // update the item removing from one masterlist and adding to another
    setMasterLists.run.call({userId: 123}, { type: 'Campaigns', item: campaignId, masterLists: [masterLists[0]._id, masterLists[2]._id] })

    const removedMasterList = MasterLists.findOne({_id: masterLists[1]._id})
    assert.equal(removedMasterList.items.length, 0, 'itemId has been removed successfully')

    const addedMasterList = MasterLists.findOne({_id: masterLists[2]._id})
    assert.equal(addedMasterList.items[0], campaignId, 'item has been added successfully')
  })
})
