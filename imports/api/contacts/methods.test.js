import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from './contacts'
import Campaigns from '../medialists/medialists'
import {
  batchAddContactsToCampaigns,
  batchFavouriteContacts
} from './methods'

describe('Contacts/batchFavouriteContacts', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => batchFavouriteContacts.run.call({}, {}), /You must be logged in/)
  })

  it('should validated the parameters', function () {
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

  it('should validated the parameters', function () {
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
