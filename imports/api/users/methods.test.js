import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import Posts from '/imports/api/posts/posts'
import MasterLists from '/imports/api/master-lists/master-lists'
import {
  update
} from './methods'
import faker from 'faker'
import toUserRef from '/imports/lib/to-user-ref'

describe('User update method', function () {
  let user

  beforeEach(function () {
    resetDatabase()

    const id = Meteor.users.insert({
      _id: Random.id(),
      profile: {
        name: faker.name.findName(),
        avatar: faker.image.cats()
      },
      myContacts: [],
      myCampaigns: []
    })

    user = Meteor.users.findOne({
      _id: id
    })
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => update.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => update.validate({name: ['a'], avatar: null}), /Name must be a string/)
    assert.throws(() => update.validate({name: null, avatar: ['a']}), /Name is required/)
    assert.throws(() => update.validate({name: 'hello', avatar: ['a']}), /Avatar must be a string/)
    assert.throws(() => update.validate({name: 'hello', avatar: 'not a url'}), /Avatar must be a valid URL/)
    assert.doesNotThrow(() => update.validate({name: faker.name.findName(), avatar: faker.image.imageUrl()}))
  })

  it('should update a user', function () {
    const data = {
      name: faker.name.findName(),
      avatar: faker.image.business()
    }

    const before = Meteor.users.findOne({_id: user._id})
    assert.notEqual(data.name, before.profile.name)
    assert.notEqual(data.avatar, before.profile.avatar)

    update.run.call({userId: user._id}, data)

    const after = Meteor.users.findOne({_id: user._id})
    assert.equal(data.name, after.profile.name)
    assert.equal(data.avatar, after.profile.avatar)
  })

  it('should update all refs to a user', function () {
    const users = Array(2).fill(0).map((_, index) => ({
      _id: Random.id(),
      profile: {
        name: faker.name.findName(),
        avatar: faker.name.findName()
      }
    }))
    users.forEach((u) => Meteor.users.insert(u))

    const userRef = {
      _id: user._id,
      name: user.profile.name,
      avatar: user.profile.avatar
    }

    const campaigns = [{
      _id: Random.id(),
      name: `${faker.hacker.phrase()}`,
      team: [
        toUserRef(users[0]),
        userRef,
        toUserRef(users[1])
      ],
      createdBy: userRef,
      updatedBy: userRef
    }, {
      _id: Random.id(),
      name: `${faker.hacker.phrase()}`,
      team: [
        toUserRef(users[0]),
        toUserRef(users[1])
      ],
      createdBy: toUserRef(users[0]),
      updatedBy: toUserRef(users[0])
    }]
    campaigns.forEach((c) => Campaigns.insert(c))

    const contacts = [{
      _id: Random.id(),
      name: faker.name.findName(),
      createdBy: userRef,
      updatedBy: userRef
    }, {
      _id: Random.id(),
      name: faker.name.findName(),
      createdBy: toUserRef(users[0]),
      updatedBy: toUserRef(users[0])
    }]
    contacts.forEach((c) => Contacts.insert(c))

    const posts = [{
      _id: Random.id(),
      type: 'type-a',
      contacts: [],
      campaigns: [],
      createdBy: userRef,
      updatedBy: userRef
    }, {
      _id: Random.id(),
      type: 'type-b',
      contacts: [],
      campaigns: [],
      createdBy: toUserRef(users[0]),
      updatedBy: toUserRef(users[0])
    }]
    posts.forEach((c) => Posts.insert(c))

    const masterLists = [{
      _id: Random.id(),
      name: faker.name.findName(),
      createdBy: userRef,
      updatedBy: userRef
    }, {
      _id: Random.id(),
      name: faker.name.findName(),
      createdBy: toUserRef(users[0]),
      updatedBy: toUserRef(users[0])
    }]
    masterLists.forEach((l) => MasterLists.insert(l))

    const data = {
      name: faker.name.findName(),
      avatar: faker.image.business()
    }

    update.run.call({userId: user._id}, data)

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
    assert.equal(updatedCampaigns[0].team[0].name, users[0].profile.name)
    assert.equal(updatedCampaigns[0].team[1].name, data.name)
    assert.equal(updatedCampaigns[0].team[2].name, users[1].profile.name)
    assert.equal(updatedCampaigns[0].createdBy.name, data.name)
    assert.equal(updatedCampaigns[0].updatedBy.name, data.name)

    assert.equal(updatedCampaigns[1].team.length, 2)
    assert.equal(updatedCampaigns[1].team[0].name, users[0].profile.name)
    assert.equal(updatedCampaigns[1].team[1].name, users[1].profile.name)
    assert.equal(updatedCampaigns[1].createdBy.name, users[0].profile.name)
    assert.equal(updatedCampaigns[1].updatedBy.name, users[0].profile.name)

    const updatedContacts = Contacts.find({
      _id: {
        $in: contacts.map(c => c._id)
      }
    }, {
      sort: {
        createdAt: 1
      }
    }).fetch()

    assert.equal(updatedContacts[0].createdBy.name, data.name)
    assert.equal(updatedContacts[0].updatedBy.name, data.name)

    assert.equal(updatedContacts[1].createdBy.name, users[0].profile.name)
    assert.equal(updatedContacts[1].updatedBy.name, users[0].profile.name)

    const updatedPosts = Posts.find({
      _id: {
        $in: posts.map(c => c._id)
      }
    }, {
      sort: {
        createdAt: 1
      }
    }).fetch()

    assert.equal(updatedPosts[0].createdBy.name, data.name)
    assert.equal(updatedPosts[0].updatedBy.name, data.name)

    assert.equal(updatedPosts[1].createdBy.name, users[0].profile.name)
    assert.equal(updatedPosts[1].updatedBy.name, users[0].profile.name)

    const updatedMasterLists = MasterLists.find({
      _id: {
        $in: masterLists.map(c => c._id)
      }
    }, {
      sort: {
        createdAt: 1
      }
    }).fetch()

    assert.equal(updatedMasterLists[0].createdBy.name, data.name)
    assert.equal(updatedMasterLists[0].updatedBy.name, data.name)

    assert.equal(updatedMasterLists[1].createdBy.name, users[0].profile.name)
    assert.equal(updatedMasterLists[1].updatedBy.name, users[0].profile.name)
  })
})
