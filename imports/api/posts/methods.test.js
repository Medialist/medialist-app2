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
import { addContactsToCampaign } from '/imports/api/contacts/methods'
import toUserRef from '/imports/lib/to-user-ref'

describe('createFeedbackPost', function () {
  let users
  let contacts
  let campaigns

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    contacts = createTestContacts(3)
    campaigns = createTestCampaigns(3)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => createFeedbackPost.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => createFeedbackPost.validate({contactSlug: contacts[0].slug}), /Campaign slug is required/)
    assert.throws(() => createFeedbackPost.validate({campaignSlug: campaigns[0].slug}), /Contact slug is required/)
    assert.throws(() => createFeedbackPost.validate({contactSlug: [contacts[0].slug], campaignSlug: campaigns[0].slug}), /must be a string/)
    assert.throws(() => createFeedbackPost.validate({
      contactSlug: contacts[0].slug,
      campaignSlug: campaigns[0].slug,
      message: 'woo',
      status: 'nope'
    }), /nope is not an allowed value/)
    assert.doesNotThrow(() => createFeedbackPost.validate({
      contactSlug: contacts[0].slug,
      campaignSlug: campaigns[0].slug,
      message: 'Very good news',
      status: 'Hot Lead'
    }))
  })

  it('should create a feedback post and update the campaign and contact', function () {
    const campaignSlug = campaigns[1].slug
    const contactSlug = contacts[0].slug
    const message = 'Tip top'
    const status = 'Hot Lead'
    const user = Meteor.users.findOne()

    const postId = createFeedbackPost.run.call({userId: users[0]._id}, {
      contactSlug, campaignSlug, message, status
    })

    const userRef = toUserRef(users[0])

    const post = Posts.findOne({
      _id: postId
    }, {
      fields: {
        _id: 0,
        createdAt: 0
      }
    })
    assert.deepEqual(post, {
      type: 'FeedbackPost',
      status,
      message,
      campaigns: [Campaigns.toRef(campaigns[1])],
      contacts: [Contacts.toRef(contacts[0])],
      embeds: [],
      createdBy: userRef
    })

    const campaign = Campaigns.findOne({slug: campaignSlug})
    assert.deepEqual(campaign.updatedBy, userRef)
    assert.deepEqual(campaign.contacts, {
      [contactSlug]: status
    })

    const contact = Contacts.findOne({slug: contactSlug})
    assert.deepEqual(contact.updatedBy, userRef)
    assert.deepEqual(contact.campaigns, {
      [campaignSlug]: {
        updatedAt: contact.campaigns[campaignSlug].updatedAt
      }
    })
    assert.ok(contact.campaigns[campaignSlug].updatedAt)
  })

  it('should not create a feedback post when there is no message and the contact already has the passed status', function () {
    const campaignSlug = campaigns[1].slug
    const contactSlug = contacts[0].slug
    const status = 'Hot Lead'
    const user = Meteor.users.findOne()

    const campaign = Campaigns.update({slug: campaignSlug}, {
      $set: {
        contacts: {
          [contactSlug]: status
        }
      }
    })

    assert.equal(Posts.find({}).count(), 3)

    createFeedbackPost.run.call({userId: user._id}, {
      contactSlug, campaignSlug, status
    })

    assert.equal(Posts.find({}).count(), 3)
  })
})

describe('createCoveragePost', function () {
  let users
  let contacts
  let campaigns

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    contacts = createTestContacts(3)
    campaigns = createTestCampaigns(3)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => createCoveragePost.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => createCoveragePost.validate({contactSlug: contacts[0].slug}), /Campaign slug is required/)
    assert.throws(() => createCoveragePost.validate({campaignSlug: campaigns[0].slug}), /Contact slug is required/)
    assert.throws(() => createCoveragePost.validate({contactSlug: [contacts[0].slug], campaignSlug: campaigns[0].slug}), /must be a string/)
    assert.throws(() => createCoveragePost.validate({
      contactSlug: contacts[0].slug,
      campaignSlug: campaigns[0].slug,
      message: 'woo',
      status: 'nope'
    }), /nope is not an allowed value/)
    assert.doesNotThrow(() => createFeedbackPost.validate({
      contactSlug: contacts[0].slug,
      campaignSlug: campaigns[0].slug,
      message: 'Very good news',
      status: 'Hot Lead'
    }))
  })

  it('should create a coverage post and update the campaign and contact', function () {
    const campaignSlug = campaigns[1].slug
    const contactSlug = contacts[0].slug
    const message = 'Tip top'
    const status = 'Hot Lead'

    const postId = createCoveragePost.run.call({
      userId: users[0]._id
    }, {
      contactSlug, campaignSlug, message, status
    })

    const userRef = toUserRef(users[0])

    const post = Posts.findOne({
      _id: postId
    }, {
      fields: {
        _id: 0,
        createdAt: 0
      }
    })
    assert.deepEqual(post, {
      type: 'CoveragePost',
      status,
      message,
      campaigns: [Campaigns.toRef(campaigns[1])],
      contacts: [Contacts.toRef(contacts[0])],
      embeds: [],
      createdBy: userRef
    })

    const campaign = Campaigns.findOne({slug: campaignSlug})
    assert.deepEqual(campaign.updatedBy, userRef)
    assert.deepEqual(campaign.contacts, {
      [contactSlug]: status
    })

    const contact = Contacts.findOne({slug: contactSlug})
    assert.deepEqual(contact.updatedBy, userRef)
    assert.deepEqual(contact.campaigns, {
      [campaignSlug]: {
        updatedAt: contact.campaigns[campaignSlug].updatedAt
      }
    })
    assert.ok(contact.campaigns[campaignSlug].updatedAt)
  })
})

describe('createNeedToKnowPost', function () {
  let users
  let contacts
  let campaigns

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    contacts = createTestContacts(3)
    campaigns = createTestCampaigns(3)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => createNeedToKnowPost.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => createNeedToKnowPost.validate({}), /Contact slug is required/)
    assert.throws(() => createNeedToKnowPost.validate({contactSlug: ['a']}), /must be a string/)
    assert.throws(() => createNeedToKnowPost.validate({
      campaignSlug: 'nope',
      contactSlug: 'a',
      message: 'message'
    }), /campaignSlug is not allowed/)
    assert.doesNotThrow(() => createNeedToKnowPost.validate({
      contactSlug: 'con',
      message: 'Do Not Call This Contact!'
    }))
  })

  it('should create a Need To Know post and update the contact', function () {
    const contactSlug = contacts[0].slug
    const message = 'Do Not Call This Contact!'

    const postId = createNeedToKnowPost.run.call({
      userId: users[0]._id
    }, {
      contactSlug, message
    })

    const userRef = toUserRef(users[0])
    const post = Posts.findOne({
      _id: postId
    }, {
      fields: {
        _id: 0,
        createdAt: 0
      }
    })
    assert.deepEqual(post, {
      type: 'NeedToKnowPost',
      message,
      campaigns: [],
      embeds: [],
      contacts: [Contacts.toRef(contacts[0])],
      createdBy: userRef
    })

    const contact = Contacts.findOne({slug: contactSlug})
    assert.deepEqual(contact.updatedBy, userRef)
  })
})

describe('updateFeedbackPost', function () {
  let users
  let contacts
  let campaigns

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(2)
    contacts = createTestContacts(1)
    campaigns = createTestCampaigns(1)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => updatePost.run.call({}, {}), /You must be logged in/)
  })

  it('should require the user updating to be the creator of the post', function () {
    const postId = createNeedToKnowPost.run.call({
      userId: users[0]._id
    }, {
      contactSlug: contacts[0].slug,
      message: faker.lorem.paragraph()
    })

    assert.throws(() => updatePost.run.call({
      userId: users[1]
    }, {
      _id: postId,
      message: 'this will throw'
    }), /You can only edit posts you created/)
  })

  it('should let users update a post and cascade updates to campaign contacts status', function () {
    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      contactSlugs: [contacts[0].slug],
      campaignSlug: campaigns[0].slug
    })

    const _id = createCoveragePost.run.call({
      userId: users[0]._id
    }, {
      contactSlug: contacts[0].slug,
      campaignSlug: campaigns[0].slug,
      message: faker.lorem.paragraph()
    })

    updatePost.run.call({
      userId: users[0]._id
    }, {
      _id,
      message: 'test update2',
      status: 'Contacted'
    })

    const updatedPost = Posts.findOne({ _id })
    const campaign = Campaigns.findOne({slug: campaigns[0].slug})

    assert.equal(updatedPost.status, 'Contacted')
    assert.equal(updatedPost.message, 'test update2')
    assert.equal(campaign.contacts[contacts[0].slug], 'Contacted')
  })
})

describe('updateCoveragePost', function () {
  let users
  let contacts
  let campaigns
  let embeds

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    contacts = createTestContacts(1)
    campaigns = createTestCampaigns(1)
    embeds = createTestEmbeds(2)
  })

  it('should remove an embed from a post', function () {
    if (process.env.CI) {
      console.warn('Not running test - see https://github.com/Medialist/medialist-app2/issues/372')
      return done()
    }

    this.timeout(60000)

    const _id = createCoveragePost.run.call({
      userId: users[0]._id
    }, {
      contactSlug: contacts[0].slug,
      campaignSlug: campaigns[0].slug,
      message: faker.lorem.paragraph() + ' https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: 'Hot Lead'
    })

    const createdPost = Posts.findOne({
      _id
    })

    assert.equal(createdPost.embeds.length, 1)

    updatePost.run.call({
      userId: users[0]._id
    }, {
      _id,
      message: 'Tip top'
    })

    const updatedPost = Posts.findOne({
      _id
    })

    assert.equal(updatedPost.embeds.length, 0)
    assert.equal(updatedPost.status, createdPost.status)
    assert.equal(updatedPost.message, 'Tip top')
  })
})

describe('updateNeedToKnowPost', function () {
  let users
  let contacts

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    contacts = createTestContacts(1)
  })

  it('should let users update a need to know post', function () {
    const message = 'Do Not Call This Contact!'
    const _id = createNeedToKnowPost.run.call({
      userId: users[0]._id
    }, {
      contactSlug: contacts[0].slug,
      message
    })

    updatePost.run.call({
      userId: users[0]._id
    }, {
      _id,
      message: 'test update'
    })

    const updatedPost = Posts.findOne({ _id })

    assert.equal(updatedPost.message, 'test update')
  })
})
