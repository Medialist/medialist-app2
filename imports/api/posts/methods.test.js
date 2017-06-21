import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import Embeds from '/imports/api/embeds/embeds'
import {
  createFeedbackPost,
  createCoveragePost,
  createNeedToKnowPost,
  createAddContactsToCampaignPost,
  updatePost
} from '/imports/api/posts/methods'
import moment from 'moment'
import faker from 'faker'

function fakeEmbed (opts) {
  opts = opts || {}
  return Object.assign({
    datePublished: faker.date.past(),
    headline: faker.commerce.productName(),
    image: {
      height: '50px',
      url: faker.internet.url(),
      width: '200px',
    },
    outlet: faker.commerce.department(),
    url: faker.internet.url(),
    urls: [faker.internet.url()],
    _id: Random.id()
  }, opts)
}


function insertTestData () {
  Meteor.users.insert({
    _id: 'alf',
    profile: {
      name: 'Alfonze',
      avatar: 'http://stat.ic/alfoto.webp'
    },
    myContacts: [],
    myCampaigns: [],
    onCampaigns: 0
  })

  const contacts = Array(3).fill(0).map((_, index) => ({
    _id: `id${index}`,
    slug: `slug${index}`,
    name: `name${index}`,
    avatar: `avatar${index}`,
    campaigns: {}
  }))
  contacts.forEach((c) => Contacts.insert(c))

  const campaigns = Array(3).fill(0).map((_, index) => ({
    _id: `id${index}`,
    slug: `slug${index}`,
    avatar: `avatar${index}`,
    name: `name${index}`,
    client: { name: `client${index}` },
    contacts: {}
  }))
  campaigns.forEach((c) => Campaigns.insert(c))
}

describe('createFeedbackPost', function () {
  beforeEach(function () {
    resetDatabase()
    insertTestData()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => createFeedbackPost.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => createFeedbackPost.validate({contactSlug: 'a'}), /Campaign slug is required/)
    assert.throws(() => createFeedbackPost.validate({campaignSlug: 'a'}), /Contact slug is required/)
    assert.throws(() => createFeedbackPost.validate({contactSlug: ['a'], campaignSlug: 'a'}), /must be a string/)
    assert.throws(() => createFeedbackPost.validate({
      contactSlug: 'a',
      campaignSlug: 'a',
      message: 'woo',
      status: 'nope'
    }), /nope is not an allowed value/)
    assert.doesNotThrow(() => createFeedbackPost.validate({
      contactSlug: 'con',
      campaignSlug: 'cam',
      message: 'Very good news',
      status: 'Hot Lead'
    }))
  })

  it('should create a feedback post and update the campaign and contact', function () {
    const campaignSlug = 'slug1'
    const contactSlug = 'slug0'
    const message = 'Tip top'
    const status = 'Hot Lead'
    const user = Meteor.users.findOne()
    createFeedbackPost.run.call({userId: user._id}, {
      contactSlug, campaignSlug, message, status
    })

    const userRef = {
      _id: user._id,
      name: 'Alfonze',
      avatar: 'http://stat.ic/alfoto.webp'
    }

    assert.equal(Posts.find({}).count(), 1)
    const post = Posts.findOne({}, {fields: {_id: 0, createdAt: 0}})
    assert.deepEqual(post, {
      type: 'FeedbackPost',
      status,
      message,
      campaigns: [{
        _id: 'id1',
        slug: campaignSlug,
        avatar: 'avatar1',
        name: 'name1',
        clientName: 'client1'
      }],
      contacts: [{
        _id: 'id0',
        slug: contactSlug,
        avatar: 'avatar0',
        name: 'name0',
        outletName: ''
      }],
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
    const campaignSlug = 'slug1'
    const contactSlug = 'slug0'
    const status = 'Hot Lead'
    const user = Meteor.users.findOne()

    const campaign = Campaigns.update({slug: campaignSlug}, {
      $set: {
        contacts: {
          [contactSlug]: status
        }
      }
    })

    assert.equal(Posts.find({}).count(), 0)

    createFeedbackPost.run.call({userId: user._id}, {
      contactSlug, campaignSlug, status
    })

    assert.equal(Posts.find({}).count(), 0)
  })
})

describe('createCoveragePost', function () {
  beforeEach(function () {
    resetDatabase()
    insertTestData()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => createCoveragePost.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => createCoveragePost.validate({contactSlug: 'a'}), /Campaign slug is required/)
    assert.throws(() => createCoveragePost.validate({campaignSlug: 'a'}), /Contact slug is required/)
    assert.throws(() => createCoveragePost.validate({contactSlug: ['a'], campaignSlug: 'a'}), /must be a string/)
    assert.throws(() => createCoveragePost.validate({
      contactSlug: 'a',
      campaignSlug: 'a',
      message: 'woo',
      status: 'nope'
    }), /nope is not an allowed value/)
    assert.doesNotThrow(() => createFeedbackPost.validate({
      contactSlug: 'con',
      campaignSlug: 'cam',
      message: 'Very good news',
      status: 'Hot Lead'
    }))
  })

  it('should create a coverage post and update the campaign and contact', function () {
    const campaignSlug = 'slug1'
    const contactSlug = 'slug0'
    const message = 'Tip top'
    const status = 'Hot Lead'
    createCoveragePost.run.call({userId: 'alf'}, {
      contactSlug, campaignSlug, message, status
    })

    const userRef = {
      _id: 'alf',
      name: 'Alfonze',
      avatar: 'http://stat.ic/alfoto.webp'
    }

    assert.equal(Posts.find({}).count(), 1)
    const post = Posts.findOne({}, {fields: {_id: 0, createdAt: 0}})
    assert.deepEqual(post, {
      type: 'CoveragePost',
      status,
      message,
      campaigns: [{
        _id: 'id1',
        slug: campaignSlug,
        avatar: 'avatar1',
        name: 'name1',
        clientName: 'client1'
      }],
      contacts: [{
        _id: 'id0',
        slug: contactSlug,
        avatar: 'avatar0',
        name: 'name0',
        outletName: ''
      }],
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
  beforeEach(function () {
    resetDatabase()
    insertTestData()
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
    const contactSlug = 'slug0'
    const message = 'Do Not Call This Contact!'
    createNeedToKnowPost.run.call({userId: 'alf'}, {
      contactSlug, message
    })

    const userRef = {
      _id: 'alf',
      name: 'Alfonze',
      avatar: 'http://stat.ic/alfoto.webp'
    }

    assert.equal(Posts.find({}).count(), 1)
    const post = Posts.findOne({}, {fields: {_id: 0, createdAt: 0}})
    assert.deepEqual(post, {
      type: 'NeedToKnowPost',
      message,
      campaigns: [],
      embeds: [],
      contacts: [{
        _id: 'id0',
        slug: contactSlug,
        avatar: 'avatar0',
        name: 'name0',
        outletName: ''
      }],
      createdBy: userRef
    })

    const contact = Contacts.findOne({slug: contactSlug})
    assert.deepEqual(contact.updatedBy, userRef)
  })
})

describe('createAddContactsToCampaignPost', function () {
  beforeEach(function () {
    resetDatabase()
    insertTestData()
  })

  it('should not create repeat postings for same action', function () {
    const contactSlugs = ['slug0', 'slug1']
    const campaignSlug = 'slug1'
    createAddContactsToCampaignPost.run.call({userId: 'alf'}, {contactSlugs, campaignSlug})
    createAddContactsToCampaignPost.run.call({userId: 'alf'}, {contactSlugs, campaignSlug})
    const posts = Posts.find().count()
    assert.equal(posts, 1)
  })
})

describe('updateFeedbackPost', function () {
  beforeEach(function () {
    resetDatabase()
    insertTestData()
    const campaignSlug = 'slug1'
    const contactSlug = 'slug0'
    const message = 'Tip top'
    const status = 'Hot Lead'
    createFeedbackPost.run.call({userId: 'alf'}, {
      contactSlug, campaignSlug, message, status
    })
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => updatePost.run.call({}, {}), /You must be logged in/)
  })

  it('should require the user updating to be the creator of the post', function () {
    const _id = Posts.findOne()._id
    assert.throws(() => updatePost.run.call({userId: 'not-alf'}, {_id, message: 'this will throw'}), /You can only edit posts you created/)
  })

  it('should let users update a post and cascade updates to campaign contacts status', function () {
    const post = Posts.findOne()

    updatePost.run.call({userId: 'alf'}, {_id: post._id, message: 'test update2', status: 'Contacted'})

    const updatedPost = Posts.findOne({ _id: post._id })
    const campaign = Campaigns.findOne({slug: 'slug1'})

    assert.equal(updatedPost.status, 'Contacted')
    assert.equal(updatedPost.message, 'test update2')
    assert.equal(campaign.contacts.slug0, 'Contacted')
  })
})

describe('updateCoveragePost', function () {
  beforeEach(function () {
    resetDatabase()
    insertTestData()
    const campaignSlug = 'slug1'
    const contactSlug = 'slug0'
    const message = 'Tip top'
    const status = 'Hot Lead'
    createCoveragePost.run.call({userId: 'alf'}, {
      contactSlug, campaignSlug, message, status
    })
    const embedId = Embeds.insert(fakeEmbed({headline: 'test'}))
    const embed = Embeds.findOneById(embedId)
    const post = Posts.findOne()
    Posts.update({ _id: post._id }, {$push: {embeds: embed}})
  })

  it('should let users update a coverage post with an embed', function () {
    const _id = Posts.findOne()._id
    const newEmbedId = Embeds.insert(fakeEmbed({headline: 'new embed'}))
    const newEmbed = Embeds.findOneById(newEmbedId)

    updatePost.run.call({userId: 'alf'}, {_id, embed: newEmbed})

    const updatedPost = Posts.findOne({ _id })

    assert.equal(updatedPost.embeds[0].headline, 'new embed')
    assert.equal(updatedPost.status, 'Hot Lead')
    assert.equal(updatedPost.message, 'Tip top')
  })
})

describe('updateNeedToKnowPost', function () {
  beforeEach(function () {
    resetDatabase()
    insertTestData()
  })

  it('should let users update a need to know post', function () {
    const contactSlug = 'slug0'
    const message = 'Do Not Call This Contact!'
    createNeedToKnowPost.run.call({userId: 'alf'}, {
      contactSlug, message
    })

    const _id = Posts.findOne()._id

    updatePost.run.call({userId: 'alf'}, {_id, message: 'test update'})

    const updatedPost = Posts.findOne({ _id })

    assert.equal(updatedPost.message, 'test update')
  })
})
