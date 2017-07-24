import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import faker from 'faker'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import Embeds from '/imports/api/embeds/embeds'
import { createFeedbackPost, createCoveragePost, createNeedToKnowPost, updatePost } from '/imports/api/posts/methods'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists, createTestEmbeds } from '/tests/fixtures/server-domain'
import { addContactsToCampaign } from '/imports/api/campaign-contacts/methods'
import { addToMyFavourites } from '/imports/api/users/users'

describe('users', function () {
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
