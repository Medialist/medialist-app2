import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from './contacts'
import Campaigns from '../medialists/medialists'
import {
  batchAddContactsToCampaigns,
  batchFavouriteContacts,
  batchRemoveContacts,
  createContact
} from './methods'

describe('Contacts/batchFavouriteContacts', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => batchFavouriteContacts.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => batchFavouriteContacts.validate({}), /Contact slugs is required/)
    assert.throws(() => batchFavouriteContacts.validate({contactSlugs: [1]}), /must be a string/)
    assert.doesNotThrow(() => batchFavouriteContacts.validate({contactSlugs: ['a']}))
  })

  it('should add all contacts to favourites', function () {
    const contacts = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      name: `${index}`,
      slug: `${index}`,
      avatar: `${index}`,
      outlets: `${index}`,
      medialists: []
    }))
    contacts.forEach((c) => Contacts.insert(c))
    Meteor.users.insert({_id: '1', myContacts: [{slug: 'oldie'}]})
    const contactSlugs = ['0', '1']
    batchFavouriteContacts.run.call({userId: '1'}, {contactSlugs})
    const user = Meteor.users.findOne('1')
    assert.equal(user.myContacts.length, 3)
    delete user.myContacts[1].updatedAt
    assert.deepEqual(user.myContacts[1], {
      _id: '0',
      name: '0',
      slug: '0',
      avatar: '0',
      outlets: '0'
    })
  })
})

describe('Contacts/batchAddContactsToCampaigns', function () {
  beforeEach(function () {
    resetDatabase()
    const contacts = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      medialists: []
    }))
    contacts.forEach((c) => Contacts.insert(c))
    const campaigns = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      contacts: {}
    }))
    campaigns.forEach((c) => Campaigns.insert(c))
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => batchAddContactsToCampaigns.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => batchAddContactsToCampaigns.validate({contactSlugs: ['a']}), /Campaign slugs is required/)
    assert.throws(() => batchAddContactsToCampaigns.validate({campaignSlugs: ['a']}), /Contact slugs is required/)
    assert.throws(() => batchAddContactsToCampaigns.validate({contactSlugs: [1], campaignSlugs: [1]}), /must be a string/)
    assert.doesNotThrow(() => batchAddContactsToCampaigns.validate({contactSlugs: ['a'], campaignSlugs: ['a']}))
  })

  it('should add all contacts to all campaigns', function () {
    const contactSlugs = ['0', '1']
    const campaignSlugs = ['1', '2']
    batchAddContactsToCampaigns.run.call({userId: 1}, {contactSlugs, campaignSlugs})

    Campaigns.find({_id: {$in: campaignSlugs}}).forEach((c) => {
      assert.deepEqual(c.contacts, {
        '0': 'To Contact',
        '1': 'To Contact'
      }, 'Campaigns contain contacts')
    })
    Contacts.find({_id: {$in: contactSlugs}}).forEach((c) => {
      assert.deepEqual(c.medialists, campaignSlugs, 'Contacts are in campaigns')
    })
  })

  it('should merge contacts with existing ones', function () {
    Campaigns.update({_id: '2'}, {$set: {contacts: {'0': 'Hot!'}}})
    Contacts.update({_id: '0'}, {$set: {medialists: ['2']}})
    const contactSlugs = ['0', '1']
    const campaignSlugs = ['1', '2']
    batchAddContactsToCampaigns.run.call({userId: 1}, {contactSlugs, campaignSlugs})

    assert.deepEqual(Campaigns.findOne({_id: '1'}).contacts, {
      '0': 'To Contact',
      '1': 'To Contact'
    }, 'Campaigns contain contacts')
    assert.deepEqual(Campaigns.findOne({_id: '2'}).contacts, {
      '0': 'Hot!',
      '1': 'To Contact'
    }, 'Campaigns contain merged contacts')
    assert.deepEqual(Campaigns.findOne({_id: '0'}).contacts, {}, 'Other campaigns are unharmed')
    Contacts.find({_id: {$in: contactSlugs}}).forEach((c) => {
      assert.equal(c.medialists.length, campaignSlugs.length, 'Contacts are in campaigns')
      assert.ok(c.medialists.includes('1'))
      assert.ok(c.medialists.includes('2'))
    })
    assert.deepEqual(Contacts.findOne({_id: '2'}).medialists, [], 'Other contacts are unharmed')
  })
})

describe('batchRemoveContacts', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => batchRemoveContacts.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => batchRemoveContacts.validate({}), /Contact ids is required/)
    assert.throws(() => batchRemoveContacts.validate({ contactIds: 'foo' }), /must be an array/)
    assert.doesNotThrow(() => batchRemoveContacts.validate({ contactIds: ['kKz46qgWmbGHrznJC'] }))
  })

  // TODO: it should use a deleted flag
  // TODO: it should it remove them from plenty other places too.
  it('should remove the contact from Contacts and all users myContacts array', function () {
    const contacts = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      name: `${index}`,
      avatar: `${index}`,
      outlets: []
    }))
    contacts.forEach((c) => Contacts.insert(c))
    const users = Array(2).fill(0).map((_, index) => ({
      _id: `${index}`,
      name: `${index}`
    }))
    users[0].myContacts = [{_id: '0'}, {_id: '1'}]
    users[1].myContacts = [{_id: '2'}, {_id: '0'}]
    users.forEach((u) => Meteor.users.insert(u))

    const userId = 'jake'
    const contactIds = ['0', '2']
    batchRemoveContacts.run.call({userId}, {contactIds})

    const user0 = Meteor.users.findOne({_id: '0'})
    assert.equal(user0.myContacts.length, 1)
    assert.deepEqual(user0.myContacts[0], {_id: '1'})

    const user1 = Meteor.users.findOne({_id: '1'})
    assert.equal(user1.myContacts.length, 0)
  })
})

describe('createContact', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => createContact.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => createContact.validate({}), /Details is required/)
    assert.throws(() => createContact.validate({ details: {
      name: 0
    }}), /must be a string/)
    assert.doesNotThrow(() => createContact.validate({ details: {
      name: 'Journaldo',
      avatar: 'https://laser.cat/lrg.png',
      outlets: [
        {label: 'Gordian', value: 'knot'}
      ],
      emails: [
        {label: 'email', value: 'j@gord.ian'}
      ],
      phones: [],
      socials: [],
      address: ''
    }}))
  })

  it('should add a doc to Contacts and the current user\'s myContacts array', function () {
    const user = {
      _id: 'kKz46qgWmbGHrznJC',
      profile: {
        name: 'Bob'
      },
      myContacts: [],
      services: {}
    }
    Meteor.users.insert(user)

    const details = {
      name: 'Journaldo',
      avatar: 'https://laser.cat/lrg.png',
      outlets: [
        {label: 'Gordian', value: 'knot'}
      ],
      emails: [
        {label: 'email', value: 'j@gord.ian'}
      ],
      phones: [],
      socials: [],
      address: ''
    }

    const userId = user._id
    createContact.run.call({userId}, {details})

    const contact = Contacts.findOne()
    Object.keys(details).forEach((k) => {
      assert.deepEqual(contact[k], details[k])
    })
    assert.equal(contact.slug, 'journaldo')

    const myContacts = Meteor.users.findOne().myContacts
    assert.equal(myContacts.length, 1)
    Object.keys(myContacts[0]).forEach((k) => {
      assert.deepEqual(myContacts[0][k], contact[k])
    })
  })
})
