import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import faker from 'faker'
import moment from 'moment'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import CampaignContacts from '/imports/api/campaign-contacts/campaign-contacts'
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
    assert.throws(() => addContactsToCampaign.validate({campaignSlug: 'a'}), /Contact slugs is required/)
    assert.throws(() => addContactsToCampaign.validate({contactSlugs: [1], campaignSlug: 1}), /must be of type String/)
    assert.doesNotThrow(() => addContactsToCampaign.validate({contactSlugs: ['a'], campaignSlug: 'a'}))
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
    assert.ok(campaign.contacts.find(slug => slug === contactSlugs[0]))
    assert.ok(campaign.contacts.find(slug => slug === contactSlugs[1]))

    const campaignContacts = CampaignContacts.find({
      slug: {
        $in: contactSlugs
      }
    }).fetch()

    assert.equal(campaignContacts.find(c => c.slug === contactSlugs[0]).status, StatusMap.toContact)
    assert.equal(campaignContacts.find(c => c.slug === contactSlugs[1]).status, StatusMap.toContact)

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

    assert.equal(Object.keys(campaign.contacts).length, 2)
    assert.ok(campaign.contacts.find(slug => slug === contactSlugs[0]))
    assert.ok(campaign.contacts.find(slug => slug === contactSlugs[1]))

    const campaignContacts = CampaignContacts.find({
      campaign: campaignSlug
    }).fetch()

    assert.ok(campaignContacts.find(c => c.slug === contactSlugs[0]).status, StatusMap.hotLead)
    assert.ok(campaignContacts.find(c => c.slug === contactSlugs[1]).status, StatusMap.toContact)

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

    const campaignContacts = CampaignContacts.find({
      campaign: campaigns[0].slug
    }).fetch()

    assert.equal(campaignContacts.length, 1)
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
    assert.throws(() => removeContactsFromCampaigns.validate({}), /Contact slugs is required/)
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

    assert.equal(Object.keys(testCampaign.contacts).length, 1)
    assert.equal(testCampaign.contacts[0], contacts[0].slug)

    const campaignContacts = CampaignContacts.find({
      campaign: campaigns[0].slug
    }).fetch()

    assert.equal(campaignContacts.length, 1)
    assert.equal(campaignContacts[0].status, StatusMap.toContact)
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
    const contactSlugs = campaign.contacts

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

    const campaignContacts = CampaignContacts.find({
      campaign: campaign.slug
    }).fetch()

    assert.equal(campaignContacts.length, 3)
    assert.equal(campaignContacts[0].status, StatusMap.completed)
    assert.equal(campaignContacts[1].status, StatusMap.completed)
    assert.equal(campaignContacts[2].status, StatusMap.completed)
    assert.ok(moment(campaign.updatedAt).isBefore(updatedCampaign.updatedAt))
    assert.equal(updatedCampaign.updatedBy._id, users[0]._id)
  })

  it('Should create a post when batch updating campaign contacts status', function () {
    const campaign = Campaigns.findOne({_id: campaigns[0]._id})
    const contactSlugs = campaign.contacts
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

    const campaignContacts = CampaignContacts.find({
      campaign: campaign.slug
    }).fetch()

    assert.equal(campaignContacts.find(c => c.slug === contacts[0].slug).status, StatusMap.completed)
    assert.equal(campaignContacts.find(c => c.slug === contacts[1].slug).status, StatusMap.completed)
    assert.equal(campaignContacts.find(c => c.slug === contacts[2].slug).status, StatusMap.toContact)
  })
})
