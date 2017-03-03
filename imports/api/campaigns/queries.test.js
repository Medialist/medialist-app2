import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '../contacts/contacts'
import { searchCampaigns } from './queries'
import Campaigns from './campaigns'

describe.only('searchCampaigns', function () {
  beforeEach(function () {
    resetDatabase()

    const contacts = Array(3).fill(0).map((_, index) => ({
      _id: `id${index}`,
      slug: `slug${index}`,
      name: `name${index}`,
      outlets: [{
        label: `orgName${index}`,
        value: `jobName${index}`
      }],
      campaigns: [],
      masterLists: []
    }))
    contacts[1].campaigns.push('slug0')
    contacts.forEach((c) => Contacts.insert(c))

    const campaigns = Array(3).fill(0).map((_, index) => ({
      _id: `id${index}`,
      slug: `slug${index}`,
      name: `name${index}`,
      purpose: `purpose${index}`,
      client: {name: `clientName${index}`},
      contacts: {},
      masterLists: []
    }))
    campaigns[0].contacts = {'slug1': 'HOTPOT'}
    campaigns[2].masterLists.push({slug: 'masterListSlug0'})
    campaigns.forEach((c) => Campaigns.insert(c))

    Meteor.users.insert({
      _id: 'alf',
      profile: { name: 'Alfonze' },
      myContacts: [],
      myCampaigns: [{_id: 'id1', slug: 'slug1'}]
    })
  })

  it('should search the contacts to the campaign', function () {
    const termSearch1Res = searchCampaigns({term: 'name1', sort: {name: -1}}).fetch()
    assert.equal(termSearch1Res.length, 1)
    assert.equal(termSearch1Res[0]._id, 'id1')

    const termSearchManyRes = searchCampaigns({term: 'name', sort: {name: -1}}).fetch()
    assert.equal(termSearchManyRes.length, 3)

    const myContactsSearch1Res = searchCampaigns({userId: 'alf', sort: {name: -1}}).fetch()
    assert.equal(myContactsSearch1Res.length, 1)

    const masterListSearch1Res = searchCampaigns({masterListSlug: 'masterListSlug0', sort: {name: -1}}).fetch()
    assert.equal(masterListSearch1Res.length, 1)
    assert.equal(masterListSearch1Res[0]._id, 'id2')
  })
})
