import { Meteor } from 'meteor/meteor'
import assert from 'assert'
import Faker from 'faker'
import { create, update, remove, addTeamMates, removeTeamMate } from './methods'
import Campaigns from './campaigns'
import { batchFavouriteCampaigns } from './methods'
import Clients from '/imports/api/clients/clients'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import MasterLists from '../master-lists/master-lists'
import Posts from '../posts/posts'

describe('Campaigns/batchFavouriteCampaigns', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => batchFavouriteCampaigns.run.call({}, {}), /You must be logged in/)
  })

  it('should validated the parameters', function () {
    assert.throws(() => batchFavouriteCampaigns.validate({}), /Campaign slugs is required/)
    assert.throws(() => batchFavouriteCampaigns.validate({campaignSlugs: [1]}), /must be a string/)
    assert.doesNotThrow(() => batchFavouriteCampaigns.validate({campaignSlugs: ['a']}))
  })

  it('should add all campaigns to favourites', function () {
    const campaigns = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      name: `${index}`,
      avatar: `${index}`
    }))
    campaigns.forEach((c) => Campaigns.insert(c))
    Meteor.users.insert({_id: '1', myCampaigns: [{slug: 'oldie'}]})
    const campaignSlugs = ['0', '1']
    batchFavouriteCampaigns.run.call({userId: '1'}, {campaignSlugs})
    const user = Meteor.users.findOne('1')
    assert.equal(user.myCampaigns.length, 3)
    const myCampaingRef = user.myCampaigns.find((c) => c.slug === '0')
    delete myCampaingRef.updatedAt
    assert.deepEqual(myCampaingRef, {
      _id: '0',
      name: '0',
      slug: '0',
      avatar: '0',
      clientName: ''
    })
  })
})

describe('Campaign update method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow update if not logged in', function () {
    const _id = Campaigns.insert({})

    assert.throws(() => {
      update.run.call(
        { userId: null },
        { _id, avatar: 'http://example.org/image.jpg' }
      )
    }, /You must be logged in/)
  })

  it('should throw if no fields to update', function () {
    const _id = Campaigns.insert({})

    assert.throws(() => {
      update.run.call({ userId: '123' }, { _id })
    }, /Missing fields to update/)
  })

  it('should update avatar', function () {
    const userId = Meteor.users.insert({
      profile: { name: 'TESTER' },
      services: {
        twitter: { profile_image_url_https: 'http://example.org/user.jpg' }
      }
    })
    const _id = Campaigns.insert({ avatar: 'http://example.org/image.jpg' })
    const updatedAvatarUrl = 'http://example.org/new_image.jpg'

    update.run.call({ userId }, { _id, avatar: updatedAvatarUrl })

    const updatedMedialist = Campaigns.findOne({ _id })
    assert.equal(updatedMedialist.avatar, updatedAvatarUrl)
  })

  it('should add a campaign to the myCampaigns list for the user', function () {
    const userId = Meteor.users.insert({
      profile: { name: 'TESTER' }
    })
    const _id = Campaigns.insert({ avatar: 'http://example.org/image.jpg' })

    update.run.call({ userId }, { _id, avatar: 'http://example.org/new_image.jpg' })

    const user = Meteor.users.findOne({ _id: userId })

    assert.equal(user.myCampaigns.length, 1)
    assert.equal(user.myCampaigns[0]._id, _id)
  })

  it('should not duplicate campaigns in the myCampaigns list for the user', function () {
    const userId = Meteor.users.insert({
      profile: { name: 'TESTER' }
    })
    const _id = Campaigns.insert({ avatar: 'http://example.org/image.jpg' })

    update.run.call({ userId }, { _id, avatar: 'http://example.org/new_image.jpg' })
    update.run.call({ userId }, { _id, name: 'A new name' })

    const user = Meteor.users.findOne({ _id: userId })

    assert.equal(user.myCampaigns.length, 1)
    assert.equal(user.myCampaigns[0]._id, _id)
  })
})

describe('Campaign create method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow create if not logged in', function () {
    const _id = Campaigns.insert({})

    assert.throws(() => {
      create.run.call(
        { userId: null },
        { _id, avatar: 'http://example.org/image.jpg' }
      )
    }, /You must be logged in/)
  })

  it('should throw if required fields are missing', function () {
    assert.throws(() => create.validate({ clientName: 'foo' }), /campaign name is required/)
    assert.throws(() => create.validate({ name: 123, clientName: 'boz' }), /campaign name must be a string/)
  })

  it('should create a campaign', function () {
    const user = { myContacts: [], myCampaigns: [], profile: { name: 'O' }, services: { twitter: {profile_image_url_https: 'https://tableflip.io/img/tableflip.min.svg'} } }
    const userId = Meteor.users.insert(user)
    const payload = { name: 'Foo' }
    const slug = create.run.call({ userId }, payload)
    const doc = Campaigns.findOne({ slug })
    assert.ok(doc)
    assert.equal(doc.name, payload.name)
  })

  it('should create a campaign and client', function () {
    const user = { myContacts: [], myCampaigns: [], profile: { name: 'O' }, services: { twitter: {profile_image_url_https: 'https://tableflip.io/img/tableflip.min.svg'} } }
    const userId = Meteor.users.insert(user)
    const payload = { name: 'Foo', clientName: 'Bar', purpose: 'Better!' }
    const slug = create.run.call({ userId }, payload)
    const doc = Campaigns.findOne({ slug })
    assert.ok(doc)
    assert.equal(doc.name, payload.name)
    assert.equal(doc.client.name, payload.clientName)
  })

  it('should create a campaign and re-use existing client info', function () {
    const user = { myContacts: [], myCampaigns: [], profile: { name: 'O'}, services: { twitter: {profile_image_url_https: 'https://tableflip.io/img/tableflip.min.svg'} } }
    const userId = Meteor.users.insert(user)
    const clientName = 'Marmite'
    Clients.insert({name: clientName})
    const payload = { name: 'Foo', purpose: 'Better!', clientName: 'marmite'}
    const slug = create.run.call({ userId }, payload)
    const doc = Campaigns.findOne({ slug })
    assert.ok(doc)
    assert.equal(doc.name, payload.name)
    assert.equal(doc.client.name, clientName)
    assert.equal(Clients.find({}).count(), 1)
  })

  it('should update the myCampaigns', function () {
    const user = { myContacts: [], myCampaigns: [], profile: { name: 'O'}, services: { twitter: {profile_image_url_https: 'https://tableflip.io/img/tableflip.min.svg'} } }
    const userId = Meteor.users.insert(user)
    const payload = { name: 'Foo', clientName: 'Bar', purpose: 'Better!'}
    const slug = create.run.call({ userId }, payload)
    const doc = Campaigns.findOne({ slug })
    assert.ok(doc)
    const myCampaigns = Meteor.users.findOne(userId).myCampaigns
    assert.equal(myCampaigns[0].name, payload.name)
    assert.equal(myCampaigns[0].clientName, payload.clientName)
  })
})

describe('Campaign add team members method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow addition of team members if not logged in', function () {
    const _id = Campaigns.insert({})

    assert.throws(() => {
      addTeamMates.run.call(
        { userId: null },
        { _id, userIds: ['foobar'] }
      )
    }, /You must be logged in/)
  })

  it('should not add a non-existent user to a team', function () {
    const user = { profile: { name: Faker.name.findName() }, services: { twitter: {profile_image_url_https: Faker.image.avatar()} } }
    const userId = Meteor.users.insert(user)
    const campaign = { name: 'Campaign', team: [] }
    const campaignId = Campaigns.insert(campaign)
    const payload = { _id: campaignId, userIds: ['foobar'] }

    addTeamMates.run.call({ userId }, payload)
    const updatedCampaign = Campaigns.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 0)
  })

  it('should allow the addition of multiple team members if logged in', function () {
    const users = Array(2).fill(0).map(() => ({ profile: { name: Faker.name.findName() }, services: { twitter: {profile_image_url_https: Faker.image.avatar()} } }))
    const userIds = users.map((user) => Meteor.users.insert(user))
    const campaign = { name: 'Campaign', team: [] }
    const campaignId = Campaigns.insert(campaign)
    const payload = { _id: campaignId, userIds }

    addTeamMates.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Campaigns.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 2)
  })

  it('should not duplicate team members', function () {
    const users = Array(2).fill(0).map(() => ({ profile: { name: Faker.name.findName() }, services: { twitter: {profile_image_url_https: Faker.image.avatar()} } }))
    const userIds = users.map((user) => Meteor.users.insert(user))
    const campaign = { name: 'Campaign', team: [{ _id: userIds[1] }] }
    const campaignId = Campaigns.insert(campaign)
    const payload = { _id: campaignId, userIds }

    addTeamMates.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Campaigns.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 2)
  })
})

describe('Campaign remove team members method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow removal of team members if not logged in', function () {
    const _id = Campaigns.insert({})

    assert.throws(() => {
      removeTeamMate.run.call(
        { userId: null },
        { _id, userId: 'foobar' }
      )
    }, /You must be logged in/)
  })

  it('should allow the removal of a team member if logged in', function () {
    const users = Array(2).fill(0).map(() => ({ profile: { name: Faker.name.findName() }, services: { twitter: {profile_image_url_https: Faker.image.avatar()} } }))
    const userIds = users.map((user) => Meteor.users.insert(user))
    const campaign = { name: 'Campaign', team: userIds.map((_id) => ({ _id })) }
    const campaignId = Campaigns.insert(campaign)
    const payload = { _id: campaignId, userId: userIds[1] }

    removeTeamMate.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Campaigns.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 1)
  })

  it('should leave team members unchanged if supplied userId is not part of team', function () {
    const users = Array(3).fill(0).map(() => ({ profile: { name: Faker.name.findName() }, services: { twitter: {profile_image_url_https: Faker.image.avatar()} } }))
    const userIds = users.map((user) => Meteor.users.insert(user))
    const campaign = { name: 'Campaign', team: userIds.slice(0, 2).map((_id) => ({ _id })) }
    const campaignId = Campaigns.insert(campaign)
    const payload = { _id: campaignId, userId: userIds[2] }

    removeTeamMate.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Campaigns.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 2)
  })
})

describe('Campaign remove method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => remove.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => remove.validate({}), /Ids is required/)
    assert.throws(() => remove.validate({ _ids: 'foo' }), /must be an array/)
    assert.doesNotThrow(() => remove.validate({ _ids: ['kKz46qgWmbGHrznJC'] }))
  })

  it('should remove the campaign from Campaigns and all other places', function () {
    const campaigns = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      name: `${index}`
    }))
    campaigns.forEach((c) => Campaigns.insert(c))
    const users = Array(2).fill(0).map((_, index) => ({
      _id: `${index}`,
      name: `${index}`
    }))
    users[0].myCampaigns = [{_id: '0'}, {_id: '1'}]
    users[1].myCampaigns = [{_id: '2'}, {_id: '0'}]
    users.forEach((u) => Meteor.users.insert(u))

    MasterLists.insert({
      type: 'Campaigns',
      name: 'A master list',
      items: [
        campaigns[0]._id,
        campaigns[1]._id,
        campaigns[2]._id
      ]
    })

    Posts.insert({
      name: 'A post with campaign 0',
      type: 'FeedbackPost',
      campaigns: [{
        _id: campaigns[0]._id
      }]
    })
    Posts.insert({
      name: 'A post with campaign 1',
      type: 'FeedbackPost',
      campaigns: [{
        _id: campaigns[1]._id
      }]
    })
    Posts.insert({
      name: 'A post with campaigns 0 1 and 2',
      type: 'CoveragePost',
      campaigns: [{
        _id: campaigns[0]._id
      }, {
        _id: campaigns[1]._id
      }, {
        _id: campaigns[2]._id
      }]
    })
    Posts.insert({
      name: 'An unrelated post',
      type: 'NeedToKnowPost',
      contacts: [{_id: 'a-contact'}],
      campaigns: []
    })

    const userId = 'jake'
    const _ids = ['0', '2']
    remove.run.call({userId}, {_ids})

    const user0 = Meteor.users.findOne({_id: '0'})
    assert.equal(user0.myCampaigns.length, 1)
    assert.deepEqual(user0.myCampaigns[0], {_id: '1'})

    const user1 = Meteor.users.findOne({_id: '1'})
    assert.equal(user1.myCampaigns.length, 0)

    const list = MasterLists.findOne({name: 'A master list'})
    assert.equal(list.items.length, 1)
    assert.deepEqual(list.items, ['1'])

    assert.equal(Campaigns.findOne({_id: '0'}), null)
    assert.ok(Campaigns.findOne({_id: '1'}))
    assert.equal(Campaigns.findOne({_id: '2'}), null)

    assert.equal(Posts.findOne({name: 'A post with campaign 0'}), null)
    assert.ok(Posts.findOne({name: 'A post with campaign 1'}))
    assert.ok(Posts.findOne({name: 'An unrelated post'}))

    const postWithAllCampaigns = Posts.findOne({name: 'A post with campaigns 0 1 and 2'})
    assert.equal(postWithAllCampaigns.campaigns.length, 1)
    assert.deepEqual(postWithAllCampaigns.campaigns, [{_id: '1'}])
  })
})
