import { Meteor } from 'meteor/meteor'
import assert from 'assert'
import { create, update } from './methods'
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
    assert.throws(() => create.validate({ name: 'foo' }), /Client name is required/)
    assert.throws(() => create.validate({ name: 123, clientName: 'boz' }), /Name must be a string/)
    assert.throws(() => create.validate({ name: 'YES', purpose: 'Zoom' }), /Client name is required/)
  })

  it('should create a medialist and client', function () {
    const user = { profile: { name: 'O'}, services: { twitter: {profile_image_url_https: 'bar'} } }
    const userId = Meteor.users.insert(user)
    const payload = { name: 'Foo', clientName: 'Bar', purpose: 'Better!'}
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
