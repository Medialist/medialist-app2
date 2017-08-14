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
  addContactsToCampaign,
  removeContactsFromCampaigns,
  batchFavouriteContacts,
  batchRemoveContacts,
  createContact,
  batchUpdateStatus
} from './methods'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists } from '/tests/fixtures/server-domain'
import toUserRef from '/imports/lib/to-user-ref'
import StatusMap from '/imports/api/contacts/status'

describe('addContactsToCampaign', function () {
  let users
  let contacts
  let camapgins

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    contacts = createTestContacts(3)
    campaigns = createTestCampaigns(3)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => addContactsToCampaign.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => addContactsToCampaign.validate({contactSlugs: ['a']}), /Campaign slug is required/)
    assert.throws(() => addContactsToCampaign.validate({contactSlugs: [1], campaignSlug: 1}), /must be of type String/)
    assert.doesNotThrow(() => addContactsToCampaign.validate({contactSlugs: ['a'], campaignSlug: 'a'}))
    assert.doesNotThrow(() => addContactsToCampaign.validate({contactSearch: { term: 'fred' }, campaignSlug: 'a'}))
  })

  it('should add all contacts to the campaign', function () {
    const contactSlugs = [contacts[0].slug, contacts[1].slug]
    const campaignSlug = campaigns[1].slug

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      contactSlugs,
      campaignSlug
    })

    const campaign = Campaigns.findOne({
      slug: campaignSlug
    })

    assert.equal(Object.keys(campaign.contacts).length, 2)
    assert.equal(campaign.contacts.find(c => c.slug === contactSlugs[0]).status, StatusMap.toContact)
    assert.equal(campaign.contacts.find(c => c.slug === contactSlugs[1]).status, StatusMap.toContact)

    const contact0 = Contacts.findOne({
      slug: contactSlugs[0]
    })

    assert.equal(contact0.campaigns.length, 1)
    assert.equal(contact0.campaigns[0], campaign.slug)

    const contact1 = Contacts.findOne({
      slug: contactSlugs[0]
    })

    assert.equal(contact1.campaigns.length, 1)
    assert.equal(contact1.campaigns[0], campaign.slug)
  })

  it('should merge contacts with existing ones', function () {
    const users = createTestUsers(1)

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      contactSlugs: [contacts[0].slug],
      campaignSlug: campaigns[2].slug
    })

    batchUpdateStatus.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[2].slug,
      contactSlugs: [
        contacts[0].slug
      ],
      status: StatusMap.hotLead
    })

    const contactSlugs = [contacts[0].slug, contacts[1].slug]
    const campaignSlug = campaigns[2].slug

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      contactSlugs,
      campaignSlug
    })

    const campaign = Campaigns.findOne({
      _id: campaigns[2]._id
    })

    assert.equal(campaign.contacts.length, 2)
    assert.equal(campaign.contacts.find(c => c.slug === contactSlugs[0]).status, StatusMap.hotLead)
    assert.equal(campaign.contacts.find(c => c.slug === contactSlugs[1]).status, StatusMap.toContact)

    assert.deepEqual(Campaigns.findOne({
      _id: campaigns[0]._id
    }).contacts, {}, 'Other campaigns are unharmed')

    Contacts.find({_id: {$in: contactSlugs}}).forEach((c) => {
      assert.equal(Object.keys(c.campaigns).length, 1, 'Contacts are in campaigns')
      assert.ok(c.campaigns.find(s => s === campaigns[1].slug))
      assert.ok(c.campaigns.find(s => s === campaigns[2].slug))
    })

    assert.deepEqual(Contacts.findOne({
      _id: contacts[2]._id
    }).campaigns, [], 'Other contacts are unharmed')
  })

  it('should not add contacts twice', function () {
    const users = createTestUsers(1)

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      contactSlugs: [contacts[0].slug],
      campaignSlug: campaigns[0].slug
    })

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      contactSlugs: [contacts[0].slug],
      campaignSlug: campaigns[0].slug
    })

    const campaign = Campaigns.findOne({
      slug: campaigns[0].slug
    })

    assert.equal(campaign.contacts.length, 1)
    assert.equal(campaign.contacts[0].slug, contacts[0].slug)
  })
})

if('should add contacts from a search', function () {
  // Set all names to Alponse
  Contacts.update({}, {
    $set: {
      outlets: [],
      name: 'Alphonse'
    }
  })
  // set contact 2's name to Ziggy
  Contacts.update({
    _id: contacts[1]._id
  }, {
    $set: {
      name: 'Ziggy'
    }
  })

  const campaignSlug = campaigns[1].slug

  const contactSearch = { term: 'Alp' }

  addContactsToCampaign.run.call({
    userId: users[0]._id
  }, {
    contactSearch,
    campaignSlug
  })

  const campaign = Campaigns.findOne({
    slug: campaignSlug
  })

  assert.equal(Object.keys(campaign.contacts).length, 2)
  campaign.contacts.forEach((c) => {
    assert.equal(c.name, 'Alphonse')
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
    assert.throws(() => removeContactsFromCampaigns.validate({}), /Campaign slugs is required/)
    assert.throws(() => removeContactsFromCampaigns.validate({ contactSlugs: 'foo' }), /must be of type Array/)
    assert.throws(() => removeContactsFromCampaigns.validate({ contactSlugs: ['foo'], campaignSlugs: 'cam' }), /must be of type Array/)
    assert.doesNotThrow(() => removeContactsFromCampaigns.validate({ contactSlugs: ['foo'], campaignSlugs: ['cam'] }))
  })

  it('should remove the contacts from the campaign', function () {
    const testUser = createTestUsers(1)[0]
    const contacts = createTestContacts(3)
    const campaigns = createTestCampaigns(1)

    addContactsToCampaign.run.call({
      userId: testUser._id
    }, {
      contactSlugs: [contacts[0].slug, contacts[2].slug],
      campaignSlug: campaigns[0].slug
    })

    removeContactsFromCampaigns.run.call({
      userId: testUser._id
    }, {
      contactSlugs: [contacts[1].slug, contacts[2].slug],
      campaignSlugs: [campaigns[0].slug]
    })

    const testCampaign = Campaigns.findOne({
      _id: campaigns[0]._id
    })

    assert.equal(testCampaign.contacts.length, 1)
    assert.equal(testCampaign.contacts[0].slug, contacts[0].slug)
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
    assert.throws(() => batchFavouriteContacts.validate({}), /Contact search is required/)
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
    assert.equal(campaign0.contacts[0].slug, contacts[1].slug)

    assert.equal(Posts.findOne({_id: aPostWithContact0Id}), null)
    assert.ok(Posts.findOne({_id: aPostWithContact1Id}))
    assert.ok(Posts.findOne({_id: anUnrelatedPostId}))

    const postWithAllContacts = Posts.findOne({_id: aPostWithContact01And2Id})
    assert.equal(postWithAllContacts.contacts.length, 1)
    assert.equal(postWithAllContacts.contacts[0].slug, contacts[1].slug)
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

describe('batchUpdateStatus', function () {
  let users
  let contacts
  let campaigns

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    contacts = createTestContacts(3)
    campaigns = createTestCampaigns(1)

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: contacts.map(contact => contact.slug)
    })
  })

  it('Should be able to batch update campaign contacts status', function () {
    const campaign = Campaigns.findOne({
      _id: campaigns[0]._id
    })
    const contactSlugs = campaign.contacts.map(c => c.slug)

    batchUpdateStatus.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaign.slug,
      contactSlugs: contactSlugs,
      status: StatusMap.completed
    })

    const updatedCampaign = Campaigns.findOne({
      _id: campaign._id
    })

    assert.equal(updatedCampaign.contacts.length, 3)
    assert.equal(updatedCampaign.contacts[0].status, StatusMap.completed)
    assert.equal(updatedCampaign.contacts[1].status, StatusMap.completed)
    assert.equal(updatedCampaign.contacts[2].status, StatusMap.completed)
    assert.ok(moment(campaign.updatedAt).isBefore(updatedCampaign.updatedAt))
    assert.equal(updatedCampaign.updatedBy._id, users[0]._id)
  })

  it('Should create a post when batch updating campaign contacts status', function () {
    const campaign = Campaigns.findOne({_id: campaigns[0]._id})
    const contactSlugs = campaign.contacts.map(c => c.slug)
    const _id = campaign._id

    batchUpdateStatus.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaign.slug,
      contactSlugs: contactSlugs,
      status: StatusMap.completed
    })

    const post = Posts.findOne({type: 'StatusUpdate'})
    assert.equal(post.status, StatusMap.completed)
    assert.equal(post.contacts.length, contactSlugs.length)
  })

  it('Should not overwrite other campaign contacts status', function () {
    const campaign = Campaigns.findOne({_id: campaigns[0]._id})

    batchUpdateStatus.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaign.slug,
      contactSlugs: [contacts[0].slug, contacts[1].slug],
      status: StatusMap.completed
    })

    const updatedCampaign = Campaigns.findOne({
      slug: campaign.slug
    })

    assert.equal(updatedCampaign.contacts.find(c => c.slug === contacts[0].slug).status, StatusMap.completed)
    assert.equal(updatedCampaign.contacts.find(c => c.slug === contacts[1].slug).status, StatusMap.completed)
    assert.equal(updatedCampaign.contacts.find(c => c.slug === contacts[2].slug).status, StatusMap.toContact)
  })
})
