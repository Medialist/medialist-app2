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

    Posts.replaceContact(
      Contacts.findOne({_id: contacts[1]._id}),
      Contacts.findOne({_id: contacts[0]._id}),
    )

    const posts = Posts.find({
      type: 'AddContactsToCampaign'
    }, {sort: {createdAt: 1}}).fetch()

    assert.equal(posts.length, 3, '3 posts in the db')
    assert.equal(posts[0].contacts.length, 1, 'only 1 contact on posts[0]')
    assert.deepEqual(
      omit(posts[0].contacts[0], ['updatedAt']),
      omit(Contacts.toRef(contacts[1]), ['updatedAt']),
      'posts[0] references contacts[1]'
    )
  })
})
