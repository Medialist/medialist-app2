import { Meteor } from 'meteor/meteor'
import assert from 'assert'
import Faker from 'faker'
import { create, update, addTeamMates, removeTeamMate } from './methods'
import Medialists from './medialists'
import Clients from '/imports/api/clients/clients'
import { resetDatabase } from 'meteor/xolvio:cleaner';

describe('Medialist update method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow update if not logged in', function () {
    const _id = Medialists.insert({})

    assert.throws(() => {
      update.run.call(
        { userId: null },
        { _id, avatar: 'http://example.org/image.jpg' }
      )
    }, /You must be logged in/)
  })

  it('should throw if no fields to update', function () {
    const _id = Medialists.insert({})

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
    const _id = Medialists.insert({ avatar: 'http://example.org/image.jpg' })
    const updatedAvatarUrl = 'http://example.org/new_image.jpg'

    update.run.call({ userId }, { _id, avatar: updatedAvatarUrl })

    const updatedMedialist = Medialists.findOne({ _id })
    assert.equal(updatedMedialist.avatar, updatedAvatarUrl)
  })
})

describe('Medialist create method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow create if not logged in', function () {
    const _id = Medialists.insert({})

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

  it('should create a medialist', function () {
    const user = { profile: { name: 'O' }, services: { twitter: {profile_image_url_https: 'bar'} } }
    const userId = Meteor.users.insert(user)
    const payload = { name: 'Foo' }
    const slug = create.run.call({ userId }, payload)
    const doc = Medialists.findOne({ slug })
    assert.ok(doc)
    assert.equal(doc.name, payload.name)
  })

  it('should create a medialist and client', function () {
    const user = { profile: { name: 'O' }, services: { twitter: {profile_image_url_https: 'bar'} } }
    const userId = Meteor.users.insert(user)
    const payload = { name: 'Foo', clientName: 'Bar', purpose: 'Better!' }
    const slug = create.run.call({ userId }, payload)
    const doc = Medialists.findOne({ slug })
    assert.ok(doc)
    assert.equal(doc.name, payload.name)
    assert.equal(doc.client.name, payload.clientName)
  })

  it('should create a medialist and re-use existing client info', function () {
    const user = { profile: { name: 'O'}, services: { twitter: {profile_image_url_https: 'bar'} } }
    const userId = Meteor.users.insert(user)
    const clientName = 'Marmite'
    Clients.insert({name: clientName})
    const payload = { name: 'Foo', purpose: 'Better!', clientName: 'marmite'}
    const slug = create.run.call({ userId }, payload)
    const doc = Medialists.findOne({ slug })
    assert.ok(doc)
    assert.equal(doc.name, payload.name)
    assert.equal(doc.client.name, clientName)
    assert.equal(Clients.find({}).count(), 1)
  })

  it('should update the myMedialists', function () {
    const user = { profile: { name: 'O'}, services: { twitter: {profile_image_url_https: 'bar'} } }
    const userId = Meteor.users.insert(user)
    const payload = { name: 'Foo', clientName: 'Bar', purpose: 'Better!'}
    const slug = create.run.call({ userId }, payload)
    const doc = Medialists.findOne({ slug })
    assert.ok(doc)
    const myMedialists = Meteor.users.findOne(userId).myMedialists
    assert.equal(myMedialists[0].name, payload.name)
    assert.equal(myMedialists[0].clientName, payload.clientName)
  })
})

describe('Medialist add team members method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow addition of team members if not logged in', function () {
    const _id = Medialists.insert({})

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
    const campaignId = Medialists.insert(campaign)
    const payload = { _id: campaignId, userIds: ['foobar'] }

    addTeamMates.run.call({ userId }, payload)
    const updatedCampaign = Medialists.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 0)
  })

  it('should allow the addition of multiple team members if logged in', function () {
    const users = Array(2).fill(0).map(() => ({ profile: { name: Faker.name.findName() }, services: { twitter: {profile_image_url_https: Faker.image.avatar()} } }))
    const userIds = users.map((user) => Meteor.users.insert(user))
    const campaign = { name: 'Campaign', team: [] }
    const campaignId = Medialists.insert(campaign)
    const payload = { _id: campaignId, userIds }

    addTeamMates.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Medialists.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 2)
  })

  it('should not duplicate team members', function () {
    const users = Array(2).fill(0).map(() => ({ profile: { name: Faker.name.findName() }, services: { twitter: {profile_image_url_https: Faker.image.avatar()} } }))
    const userIds = users.map((user) => Meteor.users.insert(user))
    const campaign = { name: 'Campaign', team: [{ _id: userIds[1] }] }
    const campaignId = Medialists.insert(campaign)
    const payload = { _id: campaignId, userIds }

    addTeamMates.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Medialists.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 2)
  })
})

describe('Medialist remove team members method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow removal of team members if not logged in', function () {
    const _id = Medialists.insert({})

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
    const campaignId = Medialists.insert(campaign)
    const payload = { _id: campaignId, userId: userIds[1] }

    removeTeamMate.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Medialists.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 1)
  })

  it('should leave team members unchanged if supplied userId is not part of team', function () {
    const users = Array(3).fill(0).map(() => ({ profile: { name: Faker.name.findName() }, services: { twitter: {profile_image_url_https: Faker.image.avatar()} } }))
    const userIds = users.map((user) => Meteor.users.insert(user))
    const campaign = { name: 'Campaign', team: userIds.slice(0, 2).map((_id) => ({ _id })) }
    const campaignId = Medialists.insert(campaign)
    const payload = { _id: campaignId, userId: userIds[2] }

    removeTeamMate.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Medialists.findOne(campaignId)
    assert.equal(updatedCampaign.team.length, 2)
  })
})
