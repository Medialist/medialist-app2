import { Meteor } from 'meteor/meteor'
import { resetDatabase } from 'meteor/xolvio:cleaner'
import assert from 'assert'
import faker from 'faker'
import Contacts from '/imports/api/contacts/contacts'
import { searchCampaignContacts } from '/imports/api/campaign-contacts/queries'
import { campaign, user, contact } from '/tests/browser/fixtures/domain'
import { addContactsToCampaign, batchUpdateStatus } from '/imports/api/campaign-contacts/methods'
import { createTestUsers, createTestContacts, createTestCampaigns, createTestCampaignLists, createTestContactLists } from '/tests/fixtures/server-domain'
import StatusMap from '/imports/api/contacts/status'

describe('searchCampaignContacts', function () {
  let users
  let contacts
  let campaigns

  beforeEach(function () {
    resetDatabase()

    users = createTestUsers(2)
    campaigns = createTestCampaigns(3)
    contacts = createTestContacts(3)

    contacts.forEach(contact => {
      contact.name = `${contact.name} name`

      Contacts.update({
        _id: contact._id
      }, {
        $set: {
          name: contact.name
        }
      })
    })

    addContactsToCampaign.run.call({
      userId: users[0]._id
    }, {
      contactSlugs: [contacts[0].slug, contacts[1].slug],
      campaignSlug: campaigns[0].slug
    })
  })

  it('should match a contact', function () {
    const result = searchCampaignContacts({
      term: contacts[1].name,
      campaignSlug: campaigns[0].slug,
      sort: {
        name: -1
      }
    }).fetch()

    assert.equal(result.length, 1)
    assert.equal(result[0].slug, contacts[1].slug)
  })

  it('should match more than one contact', function () {
    const result = searchCampaignContacts({
      term: 'name',
      campaignSlug: campaigns[0].slug,
      sort: {
        name: -1
      }
    }).fetch()

    assert.equal(result.length, 2)
    assert.ok(result.find(r => r.slug === contacts[0].slug))
    assert.ok(result.find(r => r.slug === contacts[1].slug))
  })

  it('should match a contact by status', function () {
    batchUpdateStatus.run.call({
      userId: users[0]._id
    }, {
      campaignSlug: campaigns[0].slug,
      contactSlugs: [contacts[0].slug],
      status: StatusMap.hotLead
    })

    const result = searchCampaignContacts({
      status: StatusMap.hotLead,
      campaignSlug: campaigns[0].slug,
      sort: {
        name: -1
      }
    }).fetch()

    assert.equal(result.length, 1)
    assert.equal(result[0].slug, contacts[0].slug)
  })
})
