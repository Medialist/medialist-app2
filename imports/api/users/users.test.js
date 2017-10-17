import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import faker from 'faker'
import pick from 'lodash.pick'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import Embeds from '/imports/api/embeds/embeds'
import { createFeedbackPost, createCoveragePost, createNeedToKnowPost, updatePost } from '/imports/api/posts/methods'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists, createTestEmbeds } from '/tests/fixtures/server-domain'
import { addContactsToCampaign } from '/imports/api/contacts/methods'
import { addToMyFavourites, updateContact } from '/imports/api/users/users'

describe('Users.addToMyFavourites', function () {
  let users
  let contacts
  let campaigns

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    contacts = createTestContacts(2)
    campaigns = createTestCampaigns(2)
  })

  it('should add a contact to the user\'s favourites', function () {
    assert.equal(0, Meteor.users.findOne(users[0]._id).myContacts.length)

    addToMyFavourites({
      userId: users[0]._id,
      contactSlugs: [contacts[0].slug]
    })

    const user = Meteor.users.findOne(users[0]._id)

    assert.equal(1, user.myContacts.length)
    assert.equal(contacts[0]._id, user.myContacts[0]._id)
  })

  it('should add a campaign to the user\'s favourites', function () {
    assert.equal(0, Meteor.users.findOne(users[0]._id).myCampaigns.length)

    addToMyFavourites({
      userId: users[0]._id,
      campaignSlugs: [campaigns[0].slug]
    })

    const user = Meteor.users.findOne(users[0]._id)

    assert.equal(1, user.myCampaigns.length)
    assert.equal(campaigns[0]._id, user.myCampaigns[0]._id)
  })

  it('should not add a contact to the user\'s favourites twice in the came call', function () {
    assert.equal(0, Meteor.users.findOne(users[0]._id).myContacts.length)

    addToMyFavourites({
      userId: users[0]._id,
      contactSlugs: [contacts[0].slug, contacts[0].slug]
    })

    const user = Meteor.users.findOne(users[0]._id)

    assert.equal(1, user.myContacts.length)
    assert.equal(contacts[0]._id, user.myContacts[0]._id)
  })

  it('should not add a contact to the user\'s favourites twice in two calls', function () {
    assert.equal(0, Meteor.users.findOne(users[0]._id).myContacts.length)

    addToMyFavourites({
      userId: users[0]._id,
      contactSlugs: [contacts[0].slug]
    })

    addToMyFavourites({
      userId: users[0]._id,
      contactSlugs: [contacts[0].slug]
    })

    const user = Meteor.users.findOne(users[0]._id)

    assert.equal(1, user.myContacts.length)
    assert.equal(contacts[0]._id, user.myContacts[0]._id)
  })
})

describe('Users.replaceContact', function () {
  let users
  let contacts

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(3)
    contacts = createTestContacts(2)
  })

  // Set up:
  //
  // user a: [0, 1]
  // user b: [0]
  // user c: [1]
  //
  // THen merge contact 0 into contact 1
  //
  // Expectation:
  // a: [1]
  // b: [1]
  // c: [1]
  //
  it('should replace contacts in the users favourits', function () {
    assert.equal(0, Meteor.users.findOne(users[0]._id).myContacts.length)

    addToMyFavourites({
      userId: users[0]._id,
      contactSlugs: [contacts[0].slug, contacts[1].slug]
    })

    addToMyFavourites({
      userId: users[1]._id,
      contactSlugs: [contacts[0].slug]
    })

    addToMyFavourites({
      userId: users[2]._id,
      contactSlugs: [contacts[1].slug]
    })

    const res = updateContact(
      Contacts.findOne({_id: contacts[1]._id}),
      Contacts.findOne({_id: contacts[0]._id})
    )

    const a = Meteor.users.findOne({_id: users[0]._id}).myContacts
    const b = Meteor.users.findOne({_id: users[1]._id}).myContacts
    const c = Meteor.users.findOne({_id: users[2]._id}).myContacts

    const fields = ['_id', 'name', 'slug', 'avatar']

    assert.equal(a.length, 1, '1 contacts on in myContacts user[0]')
    assert.deepEqual(pick(a[0], fields), pick(contacts[1], fields), 'users[0] now refs only contacts[1]')
    assert.deepEqual(pick(b[0], fields), pick(contacts[1], fields), 'users[1] now refs only contacts[1]')
    assert.deepEqual(pick(c[0], fields), pick(contacts[1], fields), 'users[2] now refs only contacts[1]')
  })
})