import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import faker from 'faker'
import moment from 'moment'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import MasterLists from '/imports/api/master-lists/master-lists'
import { campaign, user, contact } from '/tests/browser/fixtures/domain'
import { createCampaign } from '/imports/api/campaigns/methods'
import { createMasterList, batchAddToMasterLists } from '/imports/api/master-lists/methods'
import { createFeedbackPost, createCoveragePost } from '/imports/api/posts/methods'
import { findOneUserRef } from '/imports/api/users/users'
import {
  batchFavouriteContacts,
  batchRemoveContacts,
  createContact
} from './methods'
import {
  addContactsToCampaign,
  removeContactsFromCampaigns,
  batchUpdateStatus
} from '/imports/api/campaign-contacts/methods'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists } from '/tests/fixtures/server-domain'
import toUserRef from '/imports/lib/to-user-ref'
import StatusMap from '/imports/api/contacts/status'
import CampaignContacts from '/imports/api/campaign-contacts/campaign-contacts'

describe('batchFavouriteContacts', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => batchFavouriteContacts.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => batchFavouriteContacts.validate({}), /Contact slugs is required/)
    assert.throws(() => batchFavouriteContacts.validate({contactSlugs: [1]}), /must be of type String/)
    assert.doesNotThrow(() => batchFavouriteContacts.validate({contactSlugs: ['a']}))
  })

  it('should add all contacts to favourites', function () {
    const testUser = createTestUsers(1)[0]
    const otherUser = createTestUsers(1)[0]

    const contacts = Array(4)
      .fill(0)
      .map(() => createContact.run.call({
        userId: otherUser._id
      }, {details: contact()}))
      .map(slug => Contacts.findOne({slug}))

    assert.equal(Meteor.users.findOne(testUser._id).myContacts.length, 0)

    batchFavouriteContacts.run.call({
      userId: testUser._id
    }, {
      contactSlugs: [contacts[2].slug]
    })

    assert.equal(Meteor.users.findOne(testUser._id).myContacts.length, 1)

    batchFavouriteContacts.run.call({
      userId: testUser._id
    }, {
      contactSlugs: [contacts[0].slug, contacts[1].slug]
    })

    const userNow = Meteor.users.findOne(testUser._id)
    assert.equal(userNow.myContacts.length, 3)
    const myContactRef = userNow.myContacts.find((c) => c.slug === contacts[0].slug)

    assert.deepEqual(myContactRef, Contacts.toRef(contacts[0]))
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
    assert.throws(() => batchRemoveContacts.validate({ _ids: 'foo' }), /must be of type Array/)
    assert.doesNotThrow(() => batchRemoveContacts.validate({ _ids: ['kKz46qgWmbGHrznJC'] }))
  })

  it('should remove the contact from Contacts and all other places', function () {
    const users = createTestUsers(4)
    const contacts = createTestContacts(4)
    const masterLists = createTestContactLists(1)
    const campaigns = createTestCampaigns(2)

    batchFavouriteContacts.run.call({
      userId: users[1]._id
    }, {
      contactSlugs: [contacts[0].slug, contacts[1].slug]
    })

    batchFavouriteContacts.run.call({
      userId: users[2]._id
    }, {
      contactSlugs: [contacts[2].slug, contacts[0].slug]
    })

    batchAddToMasterLists.run.call({
      userId: users[3]._id
    }, {
      slugs: [
        contacts[0].slug,
        contacts[1].slug,
        contacts[2].slug
      ],
      masterListIds: [
        masterLists[0]._id
      ]
    })

    addContactsToCampaign.run.call({
      userId: users[3]._id
    }, {
      contactSlugs: [
        contacts[0].slug,
        contacts[1].slug,
        contacts[2].slug
      ],
      campaignSlug: campaigns[0].slug
    })

    const aPostWithContact0Id = createFeedbackPost.run.call({
      userId: users[3]._id
    }, {
      contactSlug: contacts[0].slug,
      campaignSlug: campaigns[0].slug,
      message: faker.lorem.sentence()
    })

    const aPostWithContact1Id = createCoveragePost.run.call({
      userId: users[3]._id
    }, {
      contactSlug: contacts[1].slug,
      campaignSlug: campaigns[0].slug,
      message: faker.lorem.sentence()
    })

    const aPostWithContact01And2Id = Posts.create({
      type: 'AddContactsToCampaign',
      contactSlugs: [
        contacts[0].slug,
        contacts[1].slug,
        contacts[2].slug,
      ],
      campaignSlugs: [
        campaigns[0].slug
      ],
      createdBy: findOneUserRef(users[0]._id)
    })

    const anUnrelatedPostId = Posts.create({
      type: 'AddContactsToCampaign',
      contactSlugs: [
        contacts[3].slug
      ],
      campaignSlugs: [
        campaigns[1].slug
      ],
      createdBy: findOneUserRef(users[0]._id)
    })

    const user1BeforeDelete = Meteor.users.findOne({_id: users[1]._id})
    assert.equal(user1BeforeDelete.myContacts.length, 2)
    assert.ok(user1BeforeDelete.myContacts.find(c => c._id === contacts[0]._id))
    assert.ok(user1BeforeDelete.myContacts.find(c => c._id === contacts[1]._id))

    batchRemoveContacts.run.call({
      userId: users[0]._id
    }, {
      _ids: [
        contacts[0]._id,
        contacts[2]._id
      ]
    })

    const user0 = Meteor.users.findOne({_id: users[0]._id})
    assert.ok(!user0.myContacts.find(c => c._id === contacts[0]._id))
    assert.ok(!user0.myContacts.find(c => c._id === contacts[2]._id))

    const user1 = Meteor.users.findOne({_id: users[1]._id})
    assert.ok(!user1.myContacts.find(c => c._id === contacts[0]._id))
    assert.ok(user1.myContacts.find(c => c._id === contacts[1]._id))
    assert.ok(!user1.myContacts.find(c => c._id === contacts[2]._id))

    const list = MasterLists.findOne({name: masterLists[0].name})
    assert.ok(!list.items.find(c => c._id === contacts[0]._id))
    assert.ok(!list.items.find(c => c._id === contacts[2]._id))

    const campaign0 = Campaigns.findOne({_id: campaigns[0]._id})
    assert.equal(campaign0.contacts.length, 1)
    assert.equal(campaign0.contacts[0], contacts[1].slug)

    assert.equal(Posts.findOne({_id: aPostWithContact0Id}), null)
    assert.ok(Posts.findOne({_id: aPostWithContact1Id}))
    assert.ok(Posts.findOne({_id: anUnrelatedPostId}))

    const postWithAllContacts = Posts.findOne({_id: aPostWithContact01And2Id})
    assert.equal(postWithAllContacts.contacts.length, 1)
    assert.equal(postWithAllContacts.contacts[0].slug, contacts[1].slug)

    const campaignContacts = CampaignContacts.find({
      campaign: campaigns[0].slug
    }).fetch()
    assert.equal(campaignContacts.length, 1)
    assert.equal(campaignContacts[0].slug, contacts[1].slug)
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
    }}), /must be of type String/)
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
      addresses: []
    }}))
  })

  it('should add a doc to Contacts and the current user\'s myContacts array', function () {
    const users = createTestUsers(1)

    const details = contact()
    const userId = user._id
    const slug = createContact.run.call({ userId : users[0]._id }, { details: details })

    const myContacts = Meteor.users.findOne().myContacts
    assert.equal(myContacts.length, 1)
    assert.deepEqual(myContacts[0], Contacts.findRefs({
      contactSlugs: [slug]
    })[0])
  })

  it('should strip empty addresses', function () {
    const users = createTestUsers(1)
    const details = contact()

    assert.equal(details.addresses.length, 2)

    details.addresses.push({
      street: '',
      city: '',
      postcode: '',
      country: ''
    })

    assert.equal(details.addresses.length, 3)

    const slug = createContact.run.call({
      userId : users[0]._id
    }, {
      details: details
    })

    const createdContact = Contacts.findOne({
      slug: slug
    })
    assert.equal(createdContact.addresses.length, 2)

    createdContact.addresses.forEach(address => {
      Object.keys(address).forEach(field => {
        assert.ok(address[field])
      })
    })
  })
})
