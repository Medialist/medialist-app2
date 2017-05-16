import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Posts from '/imports/api/posts/posts'
import { createFeedbackPost, createCoveragePost, createNeedToKnowPost } from '/imports/api/posts/methods'

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
    campaigns: []
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
    assert.deepEqual(contact.campaigns, [campaignSlug])
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
    assert.deepEqual(contact.campaigns, [campaignSlug])
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
