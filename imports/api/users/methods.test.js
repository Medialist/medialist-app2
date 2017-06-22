import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import Posts from '/imports/api/posts/posts'
import MasterLists from '/imports/api/master-lists/master-lists'
import {
  updateUser
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
    assert.throws(() => updateUser.validate({name: ['a'], avatar: null}), /Name must be a string/)
    assert.throws(() => updateUser.validate({name: null, avatar: ['a']}), /Name is required/)
    assert.throws(() => updateUser.validate({name: 'hello', avatar: ['a']}), /Avatar must be a string/)
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

    assert.equal(updatedCampaigns[1].team.length, 2)
    assert.ok(updatedCampaigns[1].team.find(t => t._id === users[0]._id))
    assert.equal(updatedCampaigns[1].team.find(t => t._id === users[0]._id).name, users[0].profile.name)
    assert.ok(updatedCampaigns[1].team.find(t => t._id === users[1]._id))
    assert.equal(updatedCampaigns[1].team.find(t => t._id === users[1]._id).name, data.name)
    assert.equal(updatedCampaigns[1].updatedBy.name, data.name)

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
