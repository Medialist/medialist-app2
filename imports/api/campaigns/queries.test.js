import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import faker from 'faker'
import Contacts from '/imports/api/contacts/contacts'
import { searchCampaigns } from '/imports/api/campaigns/queries'
import Campaigns from '/imports/api/campaigns/campaigns'
import { campaign, user, contact } from '/tests/browser/fixtures/domain'
import { findOneUserRef } from '/imports/api/users/users'
import { createCampaign } from '/imports/api/campaigns/methods'
import { createContact, addContactsToCampaign } from '/imports/api/contacts/methods'
import { batchFavouriteCampaigns } from '/imports/api/campaigns/methods'
import { batchAddToMasterLists, createMasterList } from '/imports/api/master-lists/methods'
import MasterLists from '/imports/api/master-lists/master-lists'

describe('searchCampaigns', function () {
  let users
  let contacts
  let campaigns
  let masterLists

  beforeEach(function () {
    resetDatabase()

    users = Array(2).fill(0)
      .map(() => Meteor.users.insert(user()))
      .map((_id) => Meteor.users.findOne(_id))

    const userId = Meteor.users.insert(user())

    contacts = Array(3).fill(0)
      .map(() => createContact.run.call({ userId: users[0]._id }, { details: contact() }))
      .map((slug) => Contacts.findOne({slug}))

    campaigns = Array(3).fill(0)
      .map(() => {
        const details = campaign()
        details.name += ' name'

        return createCampaign.run.call({ userId: users[0]._id }, details)
      })
      .map((slug) => Campaigns.findOne({slug}))

    addContactsToCampaign.run.call({ userId: users[0]._id }, {
      contactSlugs: [contacts[1].slug],
      campaignSlug: campaigns[0].slug
    })

    masterLists = Array(2).fill(0)
      .map(() => createMasterList.run.call({ userId: users[0]._id }, {
        type: 'Campaigns',
        name: faker.lorem.word()
      }))
      .map((_id) => MasterLists.findOne({_id}))

    batchAddToMasterLists.run.call({ userId: users[0]._id }, {
      type: 'Campaigns',
      slugs: [campaigns[2].slug],
      masterListIds: [masterLists[0]._id]
    })

    batchFavouriteCampaigns.run.call({ userId: users[1]._id }, {
      campaignSlugs: [campaigns[1].slug]
    })
  })

  it('should search the contacts to the campaign', function () {
    const termSearch1Res = searchCampaigns({term: campaigns[1].name, sort: {name: -1}}).fetch()
    assert.equal(termSearch1Res.length, 1)
    assert.equal(termSearch1Res[0]._id, campaigns[1]._id)

    const termSearchManyRes = searchCampaigns({term: 'name', sort: {name: -1}}).fetch()
    assert.equal(termSearchManyRes.length, 3)

    const myContactsSearch1Res = searchCampaigns({userId: users[1]._id, sort: {name: -1}}).fetch()
    assert.equal(myContactsSearch1Res.length, 1)

    const masterListSearch1Res = searchCampaigns({masterListSlug: masterLists[0].slug, sort: {name: -1}}).fetch()
    assert.equal(masterListSearch1Res.length, 1)
    assert.equal(masterListSearch1Res[0]._id, campaigns[2]._id)
  })
})
