import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import Contacts from '/imports/api/contacts/contacts'
import { searchContacts } from '/imports/api/contacts/queries'
import Campaigns from '/imports/api/campaigns/campaigns'

describe('searchContacts', function () {
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
    contacts[2].masterLists.push({slug: 'masterListSlug0'})
    contacts.forEach((c) => Contacts.insert(c))

    const campaigns = Array(3).fill(0).map((_, index) => ({
      _id: `id${index}`,
      slug: `slug${index}`,
      contacts: {}
    }))
    campaigns[0].contacts = {'slug1': 'HOTPOT'}
    campaigns.forEach((c) => Campaigns.insert(c))

    Meteor.users.insert({
      _id: 'alf',
      profile: { name: 'Alfonze' },
      myContacts: [{_id: 'id1', slug: 'slug1'}],
      myCampaigns: []
    })
  })

  it('should search the contacts to the campaign', function () {
    const termSearch1Res = searchContacts({term: 'name1', sort: {name: -1}}).fetch()
    assert.equal(termSearch1Res.length, 1)
    assert.equal(termSearch1Res[0]._id, 'id1')

    const termSearchManyRes = searchContacts({term: 'name', sort: {name: -1}}).fetch()
    assert.equal(termSearchManyRes.length, 3)

    const termAndCampaignSearch1Res = searchContacts({term: 'name', campaignSlugs: ['slug0'], sort: {name: -1}}).fetch()
    assert.equal(termAndCampaignSearch1Res.length, 1)
    assert.equal(termAndCampaignSearch1Res[0]._id, 'id1')

    const myContactsSearch1Res = searchContacts({userId: 'alf', sort: {name: -1}}).fetch()
    assert.equal(myContactsSearch1Res.length, 1)
    assert.equal(myContactsSearch1Res[0]._id, 'id1')

    const masterListSearch1Res = searchContacts({masterListSlug: 'masterListSlug0', sort: {name: -1}}).fetch()
    assert.equal(masterListSearch1Res.length, 1)
    assert.equal(masterListSearch1Res[0]._id, 'id2')
  })
})
