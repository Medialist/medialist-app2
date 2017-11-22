/* global describe beforeEach it */
import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import omit from 'lodash.omit'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import Posts from '/imports/api/posts/posts'
import { createFeedbackPost, createCoveragePost, createNeedToKnowPost, updatePost } from '/imports/api/posts/methods'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestEmbeds } from '/tests/fixtures/server-domain'
import { batchUpdateStatus, addContactsToCampaign } from '/imports/api/contacts/methods'

describe('Posts.updateContact', function () {
  let users
  let contacts
  let campaigns

  beforeEach(function () {
    resetDatabase()
    users = createTestUsers(1)
    contacts = createTestContacts(2)
    campaigns = createTestCampaigns(3)
  })

  /*
  - 0 and 1 added to a
  - 0 added to b
  - 1 added to c
  - feedback for 0 about a
  - feedback for 1 about c
  - need to know for 0
  - need to know for 1

  ** Merge 0 into 1**

  Expect
  - 0 added to a, b, c
  - feedback for 0 about a, c
  - 2 x need to knows

  */
  it('should replace the contact on all posts', function () {
    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: [contacts[0].slug, contacts[1].slug]
    })

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[1].slug,
      contactSlugs: [contacts[0].slug]
    })

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[2].slug,
      contactSlugs: [contacts[1].slug]
    })

    createFeedbackPost.run.call({
      userId: users[0]._id
    }, {
      contactSlug: contacts[0].slug,
      campaignSlug: campaigns[0].slug,
      message: 'Call again soon',
      status: 'Contacted'
    })

    createFeedbackPost.run.call({
      userId: users[0]._id
    }, {
      contactSlug: contacts[1].slug,
      campaignSlug: campaigns[2].slug,
      message: 'Laters',
      status: 'Contacted'
    })

    createNeedToKnowPost.run.call({
      userId: users[0]._id
    }, {
      contactSlug: contacts[0].slug,
      message: 'Contact 0 is lovely'
    })

    createNeedToKnowPost.run.call({
      userId: users[0]._id
    }, {
      contactSlug: contacts[0].slug,
      message: 'Contact 1 is the best'
    })

    Posts.replaceContact(
      Contacts.findOne({_id: contacts[1]._id}),
      Contacts.findOne({_id: contacts[0]._id}),
    )

    let posts = Posts.find({
      type: 'AddContactsToCampaign'
    }, {sort: {createdAt: 1}}).fetch()

    assert.equal(posts.length, 3, '3 AddContactsToCampaign posts in the db')
    assert.equal(posts[0].contacts.length, 1, 'only 1 contact on posts[0]')
    posts.forEach((p, i) => {
      assert.deepEqual(
        omit(p.contacts[0], ['updatedAt']),
        omit(Contacts.toRef(contacts[1]), ['updatedAt']),
        `AddContactsToCampaign posts[${i}] references ${contacts[1].slug}`
      )
    })

    posts = Posts.find({
      type: 'FeedbackPost'
    }, {sort: {createdAt: 1}}).fetch()

    assert.equal(posts.length, 2, '2 FeedbackPost posts in the db')
    posts.forEach((p, i) => {
      assert.deepEqual(
        omit(p.contacts[0], ['updatedAt']),
        omit(Contacts.toRef(contacts[1]), ['updatedAt']),
        `FeedbackPost posts[${i}] references ${contacts[1].slug}`
      )
    })

    posts = Posts.find({
      type: 'NeedToKnowPost'
    }, {sort: {createdAt: 1}}).fetch()

    assert.equal(posts.length, 2, '2 FeedbackPost posts in the db')
    posts.forEach((p, i) => {
      assert.deepEqual(
        omit(p.contacts[0], ['updatedAt']),
        omit(Contacts.toRef(contacts[1]), ['updatedAt']),
        `NeedToKnowPost posts[${i}] references ${contacts[1].slug}`
      )
    })
  })
})
