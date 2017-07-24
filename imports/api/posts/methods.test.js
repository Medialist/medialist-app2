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
import { batchUpdateStatus, addContactsToCampaign } from '/imports/api/campaign-contacts/methods'
import toUserRef from '/imports/lib/to-user-ref'
import CampaignContacts from '/imports/api/campaign-contacts/campaign-contacts'
import StatusMap from '/imports/api/contacts/status'

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
    assert.throws(() => createFeedbackPost.validate({contactSlug: [contacts[0].slug], campaignSlug: campaigns[0].slug}), /must be of type String/)
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

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug,
      contactSlugs: [contactSlug]
    })

    const postId = createFeedbackPost.run.call({
      userId: users[0]._id
    }, {
      contactSlug, campaignSlug, message, status
    })

    const userRef = toUserRef(users[0])

    const post = Posts.findOne({
      _id: postId
    }, {
      fields: {
        _id: 0
      }
    })
    assert.deepEqual(post, {
      type: 'FeedbackPost',
      status,
      message,
      campaigns: [
        Campaigns.findOneRef(campaigns[1]._id)
      ],
      contacts: [
        Contacts.findOneRef(contacts[0]._id)
      ],
      embeds: [],
      createdBy: userRef,
      createdAt: post.createdAt
    })

    const campaign = Campaigns.findOne({slug: campaignSlug})
    assert.deepEqual(campaign.updatedBy, userRef)

    const contact = Contacts.findOne({slug: contactSlug})
    assert.deepEqual(contact.updatedBy, userRef)
    assert.equal(contact.campaigns.length, 1)
    assert.equal(contact.campaigns[0], campaignSlug)

    const campaignContact = CampaignContacts.findOne({
      campaign: campaignSlug,
      slug: contactSlug
    })
    assert.equal(campaignContact.status, status)
    assert.equal(campaignContact.updatedAt.getTime(), post.createdAt.getTime())
    assert.deepEqual(campaignContact.updatedBy, userRef)
  })

  it('should not create a feedback post when there is no message and the contact already has the passed status', function () {
    const campaignSlug = campaigns[1].slug
    const contactSlug = contacts[0].slug
    const status = 'Hot Lead'
    const user = Meteor.users.findOne()

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug,
      contactSlugs: [contactSlug]
    })

    batchUpdateStatus.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[1].slug,
      contactSlugs: [contactSlug],
      status: status
    })

    assert.equal(Posts.find({}).count(), 5)

    createFeedbackPost.run.call({
      userId: user._id
    }, {
      contactSlug, campaignSlug, status
    })

    assert.equal(Posts.find({}).count(), 5)
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
    assert.throws(() => createCoveragePost.validate({contactSlug: [contacts[0].slug], campaignSlug: campaigns[0].slug}), /must be of type String/)
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

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug,
      contactSlugs: [contactSlug]
    })

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
        _id: 0
      }
    })
    assert.deepEqual(post, {
      type: 'CoveragePost',
      status,
      message,
      campaigns: [
        Campaigns.findOneRef(campaigns[1]._id)
      ],
      contacts: [
        Contacts.findOneRef(contacts[0]._id)
      ],
      embeds: [],
      createdBy: userRef,
      createdAt: post.createdAt
    })

    const campaign = Campaigns.findOne({slug: campaignSlug})
    assert.deepEqual(campaign.updatedBy, userRef)

    const contact = Contacts.findOne({slug: contactSlug})
    assert.deepEqual(contact.updatedBy, userRef)
    assert.equal(contact.campaigns.length, 1)
    assert.equal(contact.campaigns[0], campaignSlug)

    const campaignContact = CampaignContacts.findOne({
      campaign: campaignSlug,
      slug: contactSlug
    })
    assert.equal(campaignContact.status, status)
    assert.equal(campaignContact.updatedAt.getTime(), post.createdAt.getTime())
    assert.deepEqual(campaignContact.updatedBy, userRef)
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
    assert.throws(() => createNeedToKnowPost.validate({contactSlug: ['a']}), /must be of type String/)
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
      contacts: [
        Contacts.findOneRef(contacts[0]._id)
      ],
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
      status: StatusMap.contacted
    })

    const updatedPost = Posts.findOne({ _id })
    const campaign = Campaigns.findOne({slug: campaigns[0].slug})

    assert.equal(updatedPost.status, StatusMap.contacted)
    assert.equal(updatedPost.message, 'test update2')

    const campaignContact = CampaignContacts.findOne({
      campaign: campaign.slug,
      slug: contacts[0].slug
    })
    assert.equal(campaignContact.status, StatusMap.contacted)
    assert.equal(campaignContact.updatedAt.getTime(), updatedPost.updatedAt.getTime())
    assert.deepEqual(campaignContact.updatedBy, toUserRef(users[0]))
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
      return
    }

    this.timeout(60000)

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
      message: faker.lorem.paragraph() + ' https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      status: StatusMap.hotLead
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
