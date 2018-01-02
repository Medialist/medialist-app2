import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import assert from 'assert'
import faker from 'faker'
import babyparse from 'babyparse'
import { createCampaign, updateCampaign, removeCampaign, setTeamMates, batchFavouriteCampaigns, exportCampaignToCsv, assignContactOwner } from './methods'
import { batchUpdateStatus } from '/imports/api/contacts/methods'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import Clients from '/imports/api/clients/clients'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import MasterLists from '/imports/api/master-lists/master-lists'
import Posts from '/imports/api/posts/posts'
import toUserRef from '/imports/lib/to-user-ref'
import { campaign, user } from '/tests/browser/fixtures/domain'
import { findOneUserRef } from '/imports/api/users/users'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists } from '/tests/fixtures/server-domain'
import { addContactsToCampaign } from '/imports/api/contacts/methods'
import StatusMap from '/imports/api/contacts/status'

describe('Campaigns/batchFavouriteCampaigns', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => batchFavouriteCampaigns.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => batchFavouriteCampaigns.validate({}), /Campaign search is required/)
    assert.throws(() => batchFavouriteCampaigns.validate({campaignSlugs: [1]}), /must be of type String/)
    assert.doesNotThrow(() => batchFavouriteCampaigns.validate({campaignSlugs: ['a']}))
  })

  it('should add all campaigns to favourites', function () {
    const users = createTestUsers(1)
    const campaigns = createTestCampaigns(3)

    batchFavouriteCampaigns.run.call({
      userId: users[0]._id
    }, {
      campaignSlugs: [campaigns[0].slug, campaigns[1].slug]
    })

    const currentUser = Meteor.users.findOne(users[0]._id)
    assert.equal(currentUser.myCampaigns.length, 2)

    const myCampaignRef = currentUser.myCampaigns.find((c) => c.slug === campaigns[0].slug)

    assert.deepEqual(myCampaignRef, {
      _id: campaigns[0]._id,
      name: campaigns[0].name,
      slug: campaigns[0].slug,
      clientName: campaigns[0].client.name,
      updatedAt: campaigns[0].createdAt
    })
  })
})

describe('Campaign update method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow update if not logged in', function () {
    const userId = createTestUsers(1)[0]._id
    const slug = createCampaign.run.call({ userId }, campaign())

    assert.throws(() => {
      updateCampaign.run.call({
        userId: null
      }, {
        slug,
        avatar: 'http://example.org/image.jpg'
      })
    }, /You must be logged in/)
  })

  it('should throw if no fields to update', function () {
    const userId = createTestUsers(1)[0]._id
    const slug = createCampaign.run.call({ userId }, campaign())

    assert.throws(() => {
      updateCampaign.run.call({
        userId: userId
      }, {
        _id: userId
      })
    }, /Missing fields to update/)
  })

  it('should update avatar', function () {
    const userId = createTestUsers(1)[0]._id
    const slug = createCampaign.run.call({ userId }, campaign())
    const _id = Campaigns.findOne({ slug })._id
    const updatedAvatarUrl = 'http://example.org/new_image.jpg'

    updateCampaign.run.call({
      userId
    }, {
      _id,
      avatar: updatedAvatarUrl
    })

    const updatedMedialist = Campaigns.findOne({ _id })
    assert.equal(updatedMedialist.avatar, updatedAvatarUrl)
  })

  it('should add a campaign to the myCampaigns list for the user', function () {
    const userId = createTestUsers(1)[0]._id
    const otherUserId = createTestUsers(1)[0]._id
    const slug = createCampaign.run.call({ userId: otherUserId }, campaign())
    const _id = Campaigns.findOne({ slug })._id

    updateCampaign.run.call({
      userId
    }, {
      _id,
      avatar: 'http://example.org/new_image.jpg'
    })

    const updatedUser = Meteor.users.findOne({ _id: userId })

    assert.equal(updatedUser.myCampaigns.length, 1)
    assert.equal(updatedUser.myCampaigns[0]._id, _id)
  })

  it('should not duplicate campaigns in the myCampaigns list for the user', function () {
    const userId = createTestUsers(1)[0]._id
    const otherUserId = createTestUsers(1)[0]._id
    const slug = createCampaign.run.call({ userId: otherUserId }, campaign())
    const _id = Campaigns.findOne({ slug })._id

    updateCampaign.run.call({ userId }, { _id, avatar: 'http://example.org/new_image.jpg' })
    updateCampaign.run.call({ userId }, { _id, name: 'A new name' })

    const updatedUser = Meteor.users.findOne({ _id: userId })

    assert.equal(updatedUser.myCampaigns.length, 1)
    assert.equal(updatedUser.myCampaigns[0]._id, _id)
  })

  it('shoud not duplicate users in the campaign team list', function () {
    const users = createTestUsers(2)
    const creatorId = users[0]._id
    const editorId = users[1]._id
    const campaignSlug = createCampaign.run.call({
      userId: creatorId
    }, campaign())
    const _id = Campaigns.findOne({ slug: campaignSlug })._id

    updateCampaign.run.call({
      userId: editorId
    }, {
      _id,
      avatar: 'http://example.org/new_image.jpg'
    })

    updateCampaign.run.call({
      userId: editorId
    }, {
      _id,
      name: 'A new name'
    })

    const team = Campaigns.findOne({_id}).team

    // No dupes please, just the creating and editing user expected.
    assert.equal(team.length, 2, 'both users in list')
    assert.equal(team[0]._id, creatorId, 'Creating user is first')
    assert.equal(team[1]._id, editorId, 'Editing user is second')
  })

  it('should update campaign refs when updating campaign details', function () {
    const users = createTestUsers(1)
    const contacts = createTestContacts(1)

    const slug = createCampaign.run.call({
      userId: users[0]._id
    }, campaign())
    const _id = Campaigns.findOne({ slug })._id

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: slug,
      contactSlugs: contacts.map(contact => contact.slug)
    })

    const newName = faker.lorem.words(2)

    updateCampaign.run.call({
      userId: users[0]._id
    }, {
      _id, name: newName
    })

    // updated favourite campaign refs
    const updatedUser = Meteor.users.findOne({ _id: users[0]._id })
    assert.equal(updatedUser.myCampaigns.length, 1)
    assert.equal(updatedUser.myCampaigns[0]._id, _id)
    assert.equal(updatedUser.myCampaigns[0].name, newName)
  })
})

describe('Campaign create method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow create if not logged in', function () {
    const userId = createTestUsers(1)[0]._id
    const slug = createCampaign.run.call({ userId }, campaign())
    const _id = Campaigns.findOne({ slug })._id

    assert.throws(() => {
      createCampaign.run.call({
        userId: null
      }, {
        _id,
        avatar: 'http://example.org/image.jpg'
      })
    }, /You must be logged in/)
  })

  it('should throw if required fields are missing', function () {
    assert.throws(() => createCampaign.validate({ clientName: 'foo' }), /campaign name is required/)
    assert.throws(() => createCampaign.validate({ name: 123, clientName: 'boz' }), /campaign name must be of type String/)
  })

  it('should create a campaign', function () {
    const userId = createTestUsers(1)[0]._id
    const payload = { name: 'Foo' }
    const slug = createCampaign.run.call({ userId }, payload)
    const doc = Campaigns.findOne({ slug })
    assert.ok(doc)
    assert.ok(doc.slug)
    assert.ok(doc.createdAt)
    assert.equal(doc.name, payload.name)
    assert.equal(doc.team[0]._id, userId)
    assert.equal(doc.createdBy._id, userId)
    assert.deepEqual(doc.updatedBy, doc.createdBy)
    assert.equal(doc.updatedAt.toISOString(), doc.createdAt.toISOString())
    assert.ok(doc.links)
    assert.equal(doc.links.length, 0)
  })

  it('should create a campaign and client', function () {
    const userId = createTestUsers(1)[0]._id
    const payload = { name: 'Foo', clientName: 'Bar', purpose: 'Better!' }
    const slug = createCampaign.run.call({ userId }, payload)
    const doc = Campaigns.findOne({ slug })
    assert.ok(doc)
    assert.equal(doc.name, payload.name)
    assert.equal(doc.client.name, payload.clientName)
  })

  it('should create a campaign and re-use existing client info', function () {
    const userId = createTestUsers(1)[0]._id
    const clientName = 'Marmite'
    Clients.insert({name: clientName})
    const payload = { name: 'Foo', purpose: 'Better!', clientName: 'marmite'}
    const slug = createCampaign.run.call({ userId }, payload)
    const doc = Campaigns.findOne({ slug })
    assert.ok(doc)
    assert.equal(doc.name, payload.name)
    assert.equal(doc.client.name, clientName)
    assert.equal(Clients.find({}).count(), 1)
  })

  it('should update the myCampaigns', function () {
    const userId = createTestUsers(1)[0]._id
    const payload = { name: 'Foo', clientName: 'Bar', purpose: 'Better!'}
    const slug = createCampaign.run.call({ userId }, payload)
    const doc = Campaigns.findOne({ slug })
    assert.ok(doc)
    const updatedUser = Meteor.users.findOne(userId)
    const myCampaigns = updatedUser.myCampaigns
    assert.equal(myCampaigns[0].name, payload.name)
    assert.equal(myCampaigns[0].clientName, payload.clientName)
    assert.equal(updatedUser.onCampaigns, 1)
  })
})

describe('Campaign add team members method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should not allow addition of team members if not logged in', function () {
    const userId = createTestUsers(1)[0]._id
    const slug = createCampaign.run.call({ userId }, campaign())
    const _id = Campaigns.findOne({ slug })._id

    assert.throws(() => {
      setTeamMates.run.call(
        { userId: null },
        { _id, userIds: ['foobar'], emails: [] }
      )
    }, /You must be logged in/)
  })

  it('should not add a non-existent user to a team', function () {
    const userId = createTestUsers(1)[0]._id
    const slug = createCampaign.run.call({ userId }, campaign())
    const _id = Campaigns.findOne({ slug })._id
    const payload = { _id, userIds: ['foobar'], emails: [] }

    setTeamMates.run.call({ userId }, payload)
    const updatedCampaign = Campaigns.findOne(_id)
    assert.equal(updatedCampaign.team.length, 0)
  })

  it('should allow the addition of multiple team members if logged in', function () {
    const userId = createTestUsers(1)[0]._id
    const userIds = [createTestUsers(1)[0]._id, createTestUsers(1)[0]._id]
    const slug = createCampaign.run.call({ userId }, campaign())
    const _id = Campaigns.findOne({ slug })._id
    const payload = { _id: _id, userIds, emails: [] }

    setTeamMates.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Campaigns.findOne(_id)
    assert.equal(updatedCampaign.team.length, 2)
  })

  it('should not duplicate team members', function () {
    const userId = createTestUsers(1)[0]._id
    const userIds = [userId, userId, createTestUsers(1)[0]._id, createTestUsers(1)[0]._id]
    const slug = createCampaign.run.call({ userId }, campaign())
    const _id = Campaigns.findOne({ slug })._id
    const payload = { _id: _id, userIds, emails: [] }

    setTeamMates.run.call({ userId: userIds[0] }, payload)
    const updatedCampaign = Campaigns.findOne(_id)
    assert.equal(updatedCampaign.team.length, 3)
  })

  it('should update team member campaign counts', function () {
    const users = createTestUsers(3)

    users[0].onCampaigns = 1
    users[1].onCampaigns = 1
    users[2].onCampaigns = 0

    users.forEach(user => {
      Meteor.users.update({
        _id: user._id
      }, {
        $set: {
          onCampaigns: user.onCampaigns
        }
      })
    })

    const userIds = users.map((user) => user._id)
    const slug = createCampaign.run.call({ userId: userIds[0] }, campaign())

    assert.equal(Meteor.users.findOne(userIds[0]).onCampaigns, 2) // added, was 1
    assert.equal(Meteor.users.findOne(userIds[1]).onCampaigns, 1) // no change
    assert.equal(Meteor.users.findOne(userIds[2]).onCampaigns, 0) // no change

    const _id = Campaigns.findOne({ slug })._id

    setTeamMates.run.call({ userId: userIds[0] }, {
      _id,
      userIds: [userIds[1], userIds[2]]
    })

    assert.equal(Meteor.users.findOne(userIds[0]).onCampaigns, 1) // removed, was 1
    assert.equal(Meteor.users.findOne(userIds[1]).onCampaigns, 2) // added, was 1
    assert.equal(Meteor.users.findOne(userIds[2]).onCampaigns, 1) // added, was 0
  })

  it('should add team members by email', function () {
    Meteor.settings.public.authentication = {
      teamDomains: [
        'example.com', 'example.net', 'example.org'
      ]
    }
    Meteor.settings.email = {
      defaultFrom: 'foo@bar.com'
    }

    const userId = createTestUsers(1)[0]._id
    const slug = createCampaign.run.call({ userId }, campaign())
    const _id = Campaigns.findOne({ slug })._id

    const payload = {
      _id,
      userIds: [userId],
      emails: [faker.internet.exampleEmail()]
    }

    setTeamMates.run.call({ userId: userId }, payload)

    const updatedCampaign = Campaigns.findOne(_id)
    assert.equal(updatedCampaign.team.length, 2)
  })

  it('should add campaign to invited users favourites', function () {
    Meteor.settings.public.authentication = {
      teamDomains: [
        'example.com', 'example.net', 'example.org'
      ]
    }
    Meteor.settings.email = {
      defaultFrom: 'foo@bar.com'
    }

    const users = createTestUsers(2)
    const campaigns = createTestCampaigns(1)
    const email = faker.internet.exampleEmail()

    // current user
    assert.equal(Meteor.users.findOne({_id: users[0]._id}).myCampaigns.find(ref => ref._id === campaigns[0]._id), undefined)

    // existing user
    assert.equal(Meteor.users.findOne({_id: users[1]._id}).myCampaigns.find(ref => ref._id === campaigns[0]._id), undefined)

    const payload = {
      _id: campaigns[0]._id,
      userIds: [users[1]._id],
      emails: [email]
    }

    setTeamMates.run.call({
      userId: users[0]._id
    }, payload)

    // current user
    assert.ok(Meteor.users.findOne({_id: users[0]._id}).myCampaigns.find(ref => ref._id === campaigns[0]._id))

    // existing user
    assert.ok(Meteor.users.findOne({_id: users[1]._id}).myCampaigns.find(ref => ref._id === campaigns[0]._id))

    // invited-by-email user
    assert.ok(Meteor.users.findOne({'emails.address': email}).myCampaigns.find(ref => ref._id === campaigns[0]._id))
  })
})

describe('Campaign remove method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => removeCampaign.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => removeCampaign.validate({}), / Campaign search is required/)
    assert.throws(() => removeCampaign.validate({ campaignSlugs: 'foo' }), /must be of type Array/)
    assert.doesNotThrow(() => removeCampaign.validate({ campaignSlugs: ['kKz46qgWmbGHrznJC'] }))
  })

  it('should remove the campaign from Campaigns and all other places', function () {
    const users = createTestUsers(2)
    const campaigns = createTestCampaigns(3)
    const contacts = createTestContacts(1)

    setTeamMates.run.call({
      userId: users[0]._id
    }, {
      _id: campaigns[0]._id,
      userIds: [users[0]._id, users[1]._id]
    })
    setTeamMates.run.call({
      userId: users[0]._id
    }, {
      _id: campaigns[1]._id,
      userIds: [users[0]._id]
    })
    setTeamMates.run.call({
      userId: users[0]._id
    }, {
      _id: campaigns[2]._id,
      userIds: [users[1]._id]
    })

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: [contacts[0].slug]
    })

    MasterLists.insert({
      createdBy: toUserRef(users[0]),
      createdAt: new Date(),
      type: 'Campaigns',
      name: 'A master list',
      slug: faker.lorem.slug(),
      order: 0,
      items: [
        campaigns[0]._id,
        campaigns[1]._id,
        campaigns[2]._id
      ]
    })

    const aPostWithCampaign0 = Posts.insert({
      createdBy: toUserRef(users[0]),
      createdAt: new Date(),
      type: 'FeedbackPost',
      campaigns: [
        Campaigns.toRef(campaigns[0])
      ],
      contacts: [],
      embeds: []
    })
    const aPostWithCampaign1 = Posts.insert({
      createdBy: toUserRef(users[0]),
      createdAt: new Date(),
      type: 'FeedbackPost',
      campaigns: [
        Campaigns.toRef(campaigns[1])
      ],
      contacts: [],
      embeds: []
    })
    const aPostWithCampaigns01And2 = Posts.insert({
      createdBy: toUserRef(users[0]),
      createdAt: new Date(),
      type: 'CoveragePost',
      campaigns: [
        Campaigns.toRef(campaigns[0]),
        Campaigns.toRef(campaigns[1]),
        Campaigns.toRef(campaigns[2])
      ],
      contacts: [],
      embeds: []
    })
    const anUnrelatedPost = Posts.insert({
      createdBy: toUserRef(users[0]),
      createdAt: new Date(),
      type: 'NeedToKnowPost',
      contacts: [
        Contacts.toRef(contacts[0])
      ],
      campaigns: [],
      embeds: []
    })

    removeCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlugs: [
        campaigns[0].slug, campaigns[2].slug
      ]
    })

    const user0 = Meteor.users.findOne({_id: users[0]._id})
    assert.equal(user0.myCampaigns.length, 1)
    assert.deepEqual(user0.myCampaigns[0], Campaigns.findRefs({campaignSlugs: [campaigns[1].slug]})[0])
    assert.equal(user0.onCampaigns, 1)

    const user1 = Meteor.users.findOne({_id: users[1]._id})
    assert.equal(user1.myCampaigns.length, 0)
    assert.equal(user1.onCampaigns, 0)

    const list = MasterLists.findOne({name: 'A master list'})
    assert.equal(list.items.length, 1)
    assert.deepEqual(list.items, [campaigns[1]._id])

    const contact = Contacts.findOne({
      _id: contacts[0]._id
    })
    assert.equal(contact.campaigns.length, 0)

    assert.equal(Campaigns.findOne({_id: campaigns[0]._id}), null)
    assert.ok(Campaigns.findOne({_id: campaigns[1]._id}))
    assert.equal(Campaigns.findOne({_id: campaigns[2]._id}), null)

    assert.equal(Posts.findOne({_id: aPostWithCampaign0}), null)
    assert.ok(Posts.findOne({_id: aPostWithCampaign1}))
    assert.ok(Posts.findOne({_id: anUnrelatedPost}))

    const postWithAllCampaigns = Posts.findOne({_id: aPostWithCampaigns01And2})
    assert.equal(postWithAllCampaigns.campaigns.length, 1)
    assert.deepEqual(postWithAllCampaigns.campaigns, [Campaigns.toRef(campaigns[1])])
  })
})

describe('Export Campaign to CSV method', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => exportCampaignToCsv.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => exportCampaignToCsv.validate({}), / Campaign slug is required/)
    assert.throws(() => exportCampaignToCsv.validate({ campaignSlug: 9 }), /must be of type String/)
    assert.doesNotThrow(() => exportCampaignToCsv.validate({ campaignSlug: 'ohmy' }))
  })

  it('should return a valid csv', function () {
    const users = createTestUsers(1)
    const campaigns = createTestCampaigns(1)
    const contacts = createTestContacts(3)

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: contacts.map(s => s.slug)
    })

    batchUpdateStatus.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: [contacts[0].slug, contacts[2].slug],
      status: StatusMap.completed
    })

    const res = exportCampaignToCsv.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug
    })

    assert.equal(res.filename, `${campaigns[0].slug}.csv`)

    const csvObj = babyparse.parse(res.data, {header: false})
    assert.equal(csvObj.data.length, 4)

    const expectedHeader = ['Name', 'Outlet', 'Title', 'Status', 'Latest Activity', 'Updated At', 'Updated By', 'Owner']
    assert.deepEqual(csvObj.data[0], expectedHeader)

    const contactRows = csvObj.data.slice(1)
    contactRows.forEach((row, i) => {
      assert.equal(row[0], contacts[i].name)
      assert.equal(row[1], contacts[i].outlets[0].label)
      assert.equal(row[2], contacts[i].outlets[0].value)

      assert.equal(row[6], users[0].profile.name)
      assert.equal(row[7], users[0].profile.name)
    })

    assert.equal(contactRows[0][3], StatusMap.completed)
    assert.equal(contactRows[1][3], StatusMap.toContact)
    assert.equal(contactRows[2][3], StatusMap.completed)
    assert.equal(contactRows[0][4], 'Status updated')
    assert.equal(contactRows[1][4], '')
    assert.equal(contactRows[2][4], 'Status updated')
  })


  it('should return a csv with only the requested contacts in', function () {
    const users = createTestUsers(1)
    const campaigns = createTestCampaigns(1)
    const contacts = createTestContacts(6)

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: contacts.slice(0, 5).map(c => c.slug)
    })

    batchUpdateStatus.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: [contacts[0].slug, contacts[2].slug],
      status: StatusMap.completed
    })

    const res = exportCampaignToCsv.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: contacts.slice(0, 3).map(c => c.slug)
    })

    assert.equal(res.filename, `${campaigns[0].slug}.csv`)

    const csvObj = babyparse.parse(res.data, {header: false})
    assert.equal(csvObj.data.length, 4)

    const expectedHeader = ['Name', 'Outlet', 'Title', 'Status', 'Latest Activity', 'Updated At', 'Updated By', 'Owner']
    assert.deepEqual(csvObj.data[0], expectedHeader)

    const contactRows = csvObj.data.slice(1)
    contactRows.forEach((row, i) => {
      assert.equal(row[0], contacts[i].name)
      assert.equal(row[1], contacts[i].outlets[0].label)
      assert.equal(row[2], contacts[i].outlets[0].value)
      assert.equal(row[6], users[0].profile.name)
    })

    assert.equal(contactRows[0][3], StatusMap.completed)
    assert.equal(contactRows[1][3], StatusMap.toContact)
    assert.equal(contactRows[2][3], StatusMap.completed)
  })
})

describe.only('assignContactOwner', function () {
  beforeEach(function () {
    resetDatabase()
  })

  it('should require the user to be logged in', function () {
    assert.throws(() => assignContactOwner.run.call({}, {}), /You must be logged in/)
  })

  it('should validate the parameters', function () {
    assert.throws(() => assignContactOwner.validate({}), / Campaign slug is required/)
    assert.throws(() => assignContactOwner.validate({ campaignSlug: 9 }), /must be of type String/)
    assert.doesNotThrow(() => assignContactOwner.validate({ campaignSlug: 'ohmy', contactSlug: 'goodone', ownerUserId: 'vMpRFNGoEHigTCPLH' }))
  })

  it('should assign an owner to a campaign contact', function () {
    const users = createTestUsers(2)
    const campaigns = createTestCampaigns(1)
    const contacts = createTestContacts(3)
    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: contacts.map(c => c.slug)
    })

    // user 0 was the owner of contact 1. now set it to user 1
    assignContactOwner.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlug: contacts[1].slug,
      ownerUserId: users[1]._id
    })

    // user 0 was the owner of contact 2. now set it to user 1
    assignContactOwner.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlug: contacts[2].slug,
      ownerUserId: users[1]._id
    })

    const campaign = Campaigns.findOne({
      _id: campaigns[0]._id
    })

    const campaignContact1 = campaign.contacts.find(c => c.slug === contacts[1].slug)
    assert.deepEqual(campaignContact1.owners[0], toUserRef(users[1]), 'Contact 1 should now have user 1 has it\'s owner')

    const campaignContact2 = campaign.contacts.find(c => c.slug === contacts[2].slug)
    assert.deepEqual(campaignContact2.owners[0], toUserRef(users[1]), 'Contact 2 should now have user 1 has it\'s owner')

    const userTeamMembers = campaign.team.filter(t => t._id === users[1]._id)
    assert.equal(userTeamMembers.length, 1, 'User 1 has been added to the team')
    assert.deepEqual(userTeamMembers[0], toUserRef(users[1]), 'User 1 ref is correct')
  })
})