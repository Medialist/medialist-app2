import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import Posts from '/imports/api/posts/posts'
import MasterLists from '/imports/api/master-lists/master-lists'
import {
  updateUser,
  addRecentCampaignList,
  addRecentContactList
} from '/imports/api/users/methods'
import faker from 'faker'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists } from '/tests/fixtures/server-domain'
import toUserRef from '/imports/lib/to-user-ref'
import { setTeamMates } from '/imports/api/campaigns/methods'
import { updateContact } from '/imports/api/contacts/methods'
import { updateMasterList } from '/imports/api/master-lists/methods'

describe('User update method', function () {
  let users

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(3)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => updateUser.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => updateUser.validate({name: ['a'], avatar: null}), /Name must be of type String/)
    assert.throws(() => updateUser.validate({name: null, avatar: ['a']}), /Name is required/)
    assert.throws(() => updateUser.validate({name: 'hello', avatar: ['a']}), /Avatar must be of type String/)
    assert.throws(() => updateUser.validate({name: 'hello', avatar: 'not a url'}), /Avatar must be a valid URL/)
    assert.doesNotThrow(() => updateUser.validate({name: faker.name.findName(), avatar: faker.image.imageUrl()}))
  })

  it('should update a user', function () {
    const data = {
      name: faker.name.findName(),
      avatar: faker.image.business()
    }

    const before = Meteor.users.findOne({_id: users[0]._id})
    assert.notEqual(data.name, before.profile.name)
    assert.notEqual(data.avatar, before.profile.avatar)

    updateUser.run.call({userId: users[0]._id}, data)

    const after = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(data.name, after.profile.name)
    assert.equal(data.avatar, after.profile.avatar)
  })

  it('should update all refs to a user', function () {
    const campaigns = createTestCampaigns(1, users[0]._id)
      .concat(createTestCampaigns(1, users[1]._id))

    setTeamMates.run.call({
      userId: users[0]._id
    }, {
      _id: campaigns[0]._id,
      userIds: [
        users[0]._id,
        users[1]._id,
        users[2]._id
      ]
    })

    setTeamMates.run.call({
      userId: users[1]._id
    }, {
      _id: campaigns[1]._id,
      userIds: [
        users[0]._id,
        users[1]._id
      ]
    })

    const contacts = createTestContacts(1, users[0]._id)
      .concat(createTestContacts(1, users[1]._id))

    const masterLists = createTestCampaignLists(1, users[0]._id)
      .concat(createTestContactLists(1, users[1]._id))

    const data = {
      name: faker.name.findName(),
      avatar: faker.image.business()
    }

    updateUser.run.call({
      userId: users[1]._id
    }, data)

    const updatedCampaigns = Campaigns.find({
      _id: {
        $in: campaigns.map(c => c._id)
      }
    }, {
      sort: {
        createdAt: 1
      }
    }).fetch()

    assert.equal(updatedCampaigns[0].team.length, 3)
    assert.ok(updatedCampaigns[0].team.find(t => t._id === users[0]._id))
    assert.equal(updatedCampaigns[0].team.find(t => t._id === users[0]._id).name, users[0].profile.name)
    assert.ok(updatedCampaigns[0].team.find(t => t._id === users[1]._id))
    assert.equal(updatedCampaigns[0].team.find(t => t._id === users[1]._id).name, data.name)
    assert.ok(updatedCampaigns[0].team.find(t => t._id === users[2]._id))
    assert.equal(updatedCampaigns[0].team.find(t => t._id === users[2]._id).name, users[2].profile.name)
    assert.equal(updatedCampaigns[0].updatedBy.name, users[0].profile.name)
    assert.equal(updatedCampaigns[0].createdBy.name, users[0].profile.name)

    assert.equal(updatedCampaigns[1].team.length, 2)
    assert.ok(updatedCampaigns[1].team.find(t => t._id === users[0]._id))
    assert.equal(updatedCampaigns[1].team.find(t => t._id === users[0]._id).name, users[0].profile.name)
    assert.ok(updatedCampaigns[1].team.find(t => t._id === users[1]._id))
    assert.equal(updatedCampaigns[1].team.find(t => t._id === users[1]._id).name, data.name)
    assert.equal(updatedCampaigns[1].updatedBy.name, data.name)
    assert.equal(updatedCampaigns[1].createdBy.name, data.name)

    updateContact.run.call({
      userId: users[0]._id
    }, {
      contactId: contacts[0]._id,
      details: {
        name: faker.name.findName()
      }
    })

    updateContact.run.call({
      userId: users[1]._id
    }, {
      contactId: contacts[1]._id,
      details: {
        name: faker.name.findName()
      }
    })

    const updatedContacts = Contacts.find({
      _id: {
        $in: contacts.map(c => c._id)
      }
    }, {
      sort: {
        createdAt: 1
      }
    }).fetch()

    assert.equal(updatedContacts[0].updatedBy.name, users[0].profile.name)
    assert.equal(updatedContacts[1].updatedBy.name, data.name)

    updateMasterList.run.call({
      userId: users[0]._id
    }, {
      _id: masterLists[0]._id,
      name: faker.lorem.word()
    })

    updateMasterList.run.call({
      userId: users[1]._id
    }, {
      _id: masterLists[1]._id,
      name: faker.lorem.word()
    })

    const updatedMasterLists = MasterLists.find({
      _id: {
        $in: masterLists.map(c => c._id)
      }
    }, {
      sort: {
        createdAt: 1
      }
    }).fetch()

    assert.equal(updatedMasterLists[0].updatedBy.name, users[0].profile.name)
    assert.equal(updatedMasterLists[1].updatedBy.name, data.name)
  })
})

describe('addRecentCampaignList', function () {
  let users
  let campaignLists

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    campaignLists = createTestCampaignLists(6)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => addRecentCampaignList.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => addRecentCampaignList.validate({slug: 5}), /Slug must be of type String/)
    assert.throws(() => addRecentCampaignList.validate({}), /Slug is required/)
    assert.doesNotThrow(() => addRecentCampaignList.validate({slug: faker.lorem.slug()}))
  })

  it('should add a recent campaign list', function () {
    const user = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(0, user.recentCampaignLists.length)

    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[0].slug})

    const updatedUser = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(1, updatedUser.recentCampaignLists.length)
    assert.equal(campaignLists[0].slug, updatedUser.recentCampaignLists[0])
  })

  it('should not add the same recent campaign lists twice', function () {
    const user = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(0, user.recentCampaignLists.length)

    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[0].slug})
    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[1].slug})
    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[0].slug})

    const updatedUser = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(2, updatedUser.recentCampaignLists.length)
    assert.equal(campaignLists[0].slug, updatedUser.recentCampaignLists[0])
    assert.equal(campaignLists[1].slug, updatedUser.recentCampaignLists[1])
  })

  it('should only add 5 recent campaign lists', function () {
    const user = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(0, user.recentCampaignLists.length)

    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[0].slug})
    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[1].slug})
    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[2].slug})
    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[3].slug})
    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[4].slug})
    addRecentCampaignList.run.call({userId: users[0]._id}, {slug: campaignLists[5].slug})

    const updatedUser = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(5, updatedUser.recentCampaignLists.length)
    assert.equal(campaignLists[5].slug, updatedUser.recentCampaignLists[0])
    assert.equal(campaignLists[4].slug, updatedUser.recentCampaignLists[1])
    assert.equal(campaignLists[3].slug, updatedUser.recentCampaignLists[2])
    assert.equal(campaignLists[2].slug, updatedUser.recentCampaignLists[3])
    assert.equal(campaignLists[1].slug, updatedUser.recentCampaignLists[4])
  })
})

describe('addRecentContactList', function () {
  let users
  let contactLists

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(1)
    contactLists = createTestContactLists(6)
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => addRecentContactList.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => addRecentContactList.validate({slug: 5}), /Slug must be of type String/)
    assert.throws(() => addRecentContactList.validate({}), /Slug is required/)
    assert.doesNotThrow(() => addRecentContactList.validate({slug: faker.lorem.slug()}))
  })

  it('should add a recent contact list', function () {
    const user = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(0, user.recentContactLists.length)

    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[0].slug})

    const updatedUser = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(1, updatedUser.recentContactLists.length)
    assert.equal(contactLists[0].slug, updatedUser.recentContactLists[0])
  })

  it('should not add the same recent contact list twice', function () {
    const user = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(0, user.recentContactLists.length)

    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[0].slug})
    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[1].slug})
    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[0].slug})

    const updatedUser = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(2, updatedUser.recentContactLists.length)
    assert.equal(contactLists[0].slug, updatedUser.recentContactLists[0])
    assert.equal(contactLists[1].slug, updatedUser.recentContactLists[1])
  })

  it('should only add 5 recent contact lists', function () {
    const user = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(0, user.recentContactLists.length)

    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[0].slug})
    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[1].slug})
    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[2].slug})
    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[3].slug})
    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[4].slug})
    addRecentContactList.run.call({userId: users[0]._id}, {slug: contactLists[5].slug})

    const updatedUser = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(5, updatedUser.recentContactLists.length)
    assert.equal(contactLists[5].slug, updatedUser.recentContactLists[0])
    assert.equal(contactLists[4].slug, updatedUser.recentContactLists[1])
    assert.equal(contactLists[3].slug, updatedUser.recentContactLists[2])
    assert.equal(contactLists[2].slug, updatedUser.recentContactLists[3])
    assert.equal(contactLists[1].slug, updatedUser.recentContactLists[4])
  })
})
