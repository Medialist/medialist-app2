import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import MasterLists from '/imports/api/master-lists/master-lists'
import {
  addContactsToCampaign,
  removeContactsFromCampaigns,
  batchFavouriteContacts,
  batchRemoveContacts,
  createContact
} from './methods'

describe('addContactsToCampaign', function () {
  beforeEach(function () {
    resetDatabase()

    Meteor.users.insert({
      _id: 'alf',
      profile: { name: 'Alfonze' },
      myContacts: [],
      myCampaigns: []
    })

    const contacts = Array(3).fill(0).map((_, index) => ({
      _id: `id${index}`,
      slug: `slug${index}`,
      campaigns: []
    }))
    contacts.forEach((c) => Contacts.insert(c))

    const campaigns = Array(3).fill(0).map((_, index) => ({
      _id: `id${index}`,
      slug: `slug${index}`,
      contacts: {}
    }))
    campaigns.forEach((c) => Campaigns.insert(c))
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => addContactsToCampaign.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => addContactsToCampaign.validate({contactSlugs: ['a']}), /Campaign slug is required/)
    assert.throws(() => addContactsToCampaign.validate({campaignSlug: 'a'}), /Contact slugs is required/)
    assert.throws(() => addContactsToCampaign.validate({contactSlugs: [1], campaignSlug: 1}), /must be a string/)
    assert.doesNotThrow(() => addContactsToCampaign.validate({contactSlugs: ['a'], campaignSlug: 'a'}))
  })

  it('should add all contacts to the campaign', function () {
    const contactSlugs = ['slug0', 'slug1']
    const campaignSlug = 'slug1'
    addContactsToCampaign.run.call({userId: 'alf'}, {contactSlugs, campaignSlug})

    Campaigns.find({slug: campaignSlug}).forEach((c) => {
      assert.deepEqual(c.contacts, {
        'slug0': 'To Contact',
        'slug1': 'To Contact'
      }, 'Campaigns contain contacts')
    })

    Contacts.find({slug: {$in: contactSlugs}}).forEach((c) => {
      assert.deepEqual(c.campaigns, [campaignSlug], 'Contacts are in campaigns')
    })
  })

  it('should merge contacts with existing ones', function () {
    Campaigns.update({_id: 'id2'}, {$set: {contacts: {'slug0': 'Hot!'}}})
    Contacts.update({_id: 'id0'}, {$set: {campaigns: ['slug2']}})
    const contactSlugs = ['slug0', 'slug1']
    const campaignSlug = 'slug2'
    addContactsToCampaign.run.call({userId: 'alf'}, {contactSlugs, campaignSlug})

    assert.deepEqual(Campaigns.findOne({_id: 'id2'}).contacts, {
      'slug0': 'Hot!',
      'slug1': 'To Contact'
    }, 'Campaigns contain merged contacts')

    assert.deepEqual(Campaigns.findOne({_id: 'id0'}).contacts, {}, 'Other campaigns are unharmed')

    Contacts.find({_id: {$in: contactSlugs}}).forEach((c) => {
      assert.equal(c.campaigns.length, 1, 'Contacts are in campaigns')
      assert.ok(c.campaigns.includes('slug1'))
      assert.ok(c.campaigns.includes('slug2'))
    })

    assert.deepEqual(Contacts.findOne({_id: 'id2'}).campaigns, [], 'Other contacts are unharmed')
  })
})

describe('removeContactsFromCampaigns', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => removeContactsFromCampaigns.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => removeContactsFromCampaigns.validate({}), /Contact slugs is required/)
    assert.throws(() => removeContactsFromCampaigns.validate({ contactSlugs: 'foo' }), /must be an array/)
    assert.throws(() => removeContactsFromCampaigns.validate({ contactSlugs: ['foo'], campaignSlugs: 'cam' }), /must be an array/)
    assert.doesNotThrow(() => removeContactsFromCampaigns.validate({ contactSlugs: ['foo'], campaignSlugs: ['cam'] }))
  })

  // TODO: it should use a deleted flag
  // TODO: it should it remove them from plenty other places too.
  it('should remove the contacts from the campaign', function () {
    const user = {
      _id: 'kKz46qgWmbGHrznJC',
      profile: {
        name: 'Bob'
      },
      myContacts: [],
      services: {}
    }
    Meteor.users.insert(user)

    const contacts = Array(3).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      name: `${index}`,
      avatar: `${index}`,
      outlets: []
    }))
    contacts[0].campaigns = ['0']
    contacts[2].campaigns = ['0']
    contacts.forEach((c) => Contacts.insert(c))

    const campaigns = Array(1).fill(0).map((_, index) => ({
      _id: `${index}`,
      slug: `${index}`,
      contacts: { '2': { slug: '2' }, '0': { slug: '0' } }
    }))
    campaigns.forEach((c) => Campaigns.insert(c))

    const userId = 'kKz46qgWmbGHrznJC'
    const contactSlugs = ['1', '2']
    const campaignSlugs = ['0']
    removeContactsFromCampaigns.run.call({userId}, {contactSlugs, campaignSlugs})

    const campaign = Campaigns.findOne()

    assert.equal(Object.keys(campaign.contacts).length, 1)
    assert.deepEqual(campaign.contacts['0'], { slug: '0' })
  })
})

describe('batchFavouriteContacts', function () {
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
      campaigns: []
    }))
    contacts.forEach((c) => Contacts.insert(c))
    Meteor.users.insert({_id: '1', myContacts: [{slug: 'oldie'}]})
    const contactSlugs = ['0', '1']
    batchFavouriteContacts.run.call({userId: '1'}, {contactSlugs})
    const user = Meteor.users.findOne('1')
    assert.equal(user.myContacts.length, 3)
    const myContactRef = user.myContacts.find((c) => c.slug === '0')
    delete myContactRef.updatedAt
    assert.deepEqual(myContactRef, {
      _id: '0',
      name: '0',
      slug: '0',
      avatar: '0',
      outlets: '0'
    })
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
    assert.throws(() => batchRemoveContacts.validate({}), /Ids is required/)
    assert.throws(() => batchRemoveContacts.validate({ _ids: 'foo' }), /must be an array/)
    assert.doesNotThrow(() => batchRemoveContacts.validate({ _ids: ['kKz46qgWmbGHrznJC'] }))
  })

  it('should remove the contact from Contacts and all other places', function () {
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

    MasterLists.insert({
      type: 'Contacts',
      name: 'A master list',
      items: [
        contacts[0]._id,
        contacts[1]._id,
        contacts[2]._id
      ]
    })

    Campaigns.insert({
      name: 'A campaign',
      contacts: {
        [contacts[0].slug]: 'to-contact',
        [contacts[1].slug]: 'to-contact',
        [contacts[2].slug]: 'to-contact'
      }
    })

    Posts.insert({
      name: 'A post with contact 0',
      type: 'FeedbackPost',
      contacts: [{
        _id: contacts[0]._id
      }]
    })
    Posts.insert({
      name: 'A post with contact 1',
      type: 'FeedbackPost',
      contacts: [{
        _id: contacts[1]._id
      }]
    })
    Posts.insert({
      name: 'A post with contact 0 1 and 2',
      type: 'CoveragePost',
      contacts: [{
        _id: contacts[0]._id
      }, {
        _id: contacts[1]._id
      }, {
        _id: contacts[2]._id
      }]
    })
    Posts.insert({
      name: 'An unrelated post',
      type: 'CampaignPost',
      contacts: []
    })

    const userId = 'jake'
    const _ids = ['0', '2']
    batchRemoveContacts.run.call({userId}, {_ids})

    const user0 = Meteor.users.findOne({_id: '0'})
    assert.equal(user0.myContacts.length, 1)
    assert.deepEqual(user0.myContacts[0], {_id: '1'})

    const user1 = Meteor.users.findOne({_id: '1'})
    assert.equal(user1.myContacts.length, 0)

    const list = MasterLists.findOne({name: 'A master list'})
    assert.equal(list.items.length, 1)
    assert.deepEqual(list.items, ['1'])

    const campaign = Campaigns.findOne({name: 'A campaign'})
    assert.equal(Object.keys(campaign.contacts).length, 1)
    assert.deepEqual(campaign.contacts, {'1': 'to-contact'})

    assert.equal(Posts.findOne({name: 'A post with contact 0'}), null)
    assert.ok(Posts.findOne({name: 'A post with contact 1'}))
    assert.ok(Posts.findOne({name: 'An unrelated post'}))

    const postWithAllContacts = Posts.findOne({name: 'A post with contact 0 1 and 2'})
    assert.equal(postWithAllContacts.contacts.length, 1)
    assert.deepEqual(postWithAllContacts.contacts, [{_id: '1'}])
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
