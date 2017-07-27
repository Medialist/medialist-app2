import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/server/contacts'
import { publishAllForLoggedInUser } from '/imports/lib/publish-all'
import * as Queries from '/imports/api/contacts/queries'
import StatusMap from '/imports/api/contacts/status'

publishAllForLoggedInUser(Queries)

const contactCounter = new Counter('contactCount', Contacts.find({}), 3000)

Meteor.publish('contactCount', function () {
  return contactCounter
})

Meteor.publish('my-contacts-and-campaigns', function () {
  if (!this.userId) {
    return this.ready()
  }

  return [
    Contacts.find({}, { sort: { updatedAt: -1 }, limit: 2000 }),
    Campaigns.find({}, { sort: { updatedAt: -1 }, limit: 2000 })
  ]
})

Meteor.publish('contact-page', function (slug) {
  if (!this.userId) {
    return this.ready()
  }

  check(slug, String)

  return [
    Contacts.find({
      slug
    }, {
      fields: {
        importedData: 0
      }
    }),
    Campaigns.find({
      contacts: {
        slug: slug
      }
    })
  ]
})

// Returns a list of CampaignRef-like objects for campaigns a contact is on
Meteor.publish('contact-campaigns', function (contactSlug) {
  if (!this.userId) {
    return this.ready()
  }

  check(contactSlug, String)

  ReactiveAggregate(this, Contacts, [{
    // filter by contact
    $match: {
      slug: contactSlug
    }
  }, {
    // keep the contact slug & campaign list
    $project: {
      contact: '$slug',
      campaigns: 1
    }
  }, {
    // one document per campain
    $unwind: '$campaigns'
  }, {
    // look up campaign details
    $lookup: {
      from: 'campaigns',
      localField: 'campaigns',
      foreignField: 'slug',
      as: 'remote_campaign'
    }
  }, {
    // make campaign not an array
    $unwind: {
      path: '$remote_campaign'
    }
  }, {
    // filter campaign contacts so only this contact is present
    $project: {
      contact: '$contact',
      remote_campaign: '$remote_campaign',
      remote_campaign_contact: {
        $filter: {
          input: '$remote_campaign.contacts',
          as: 'campaignContact',
          cond: {
            $eq: ['$$campaignContact.slug', contactSlug]
          }
        }
      }
    }
  }, {
    // make campaign contacts not an array
    $unwind: {
      path: '$remote_campaign_contact'
    }
  }, {
    // grab data fields from contact, campaign and campaign contact
    $project: {
      _id: {
        $concat: ['$_id', '-', '$remote_campaign._id']
      },
      contact: '$contact',
      slug: '$remote_campaign.slug',
      name: '$remote_campaign.name',
      avatar: '$remote_campaign.avatar',
      clientName: '$remote_campaign.client.name',
      purpose: '$remote_campaign.purpose',
      status: '$remote_campaign_contact.status',
      updatedAt: '$remote_campaign_contact.updatedAt',
      updatedBy: '$remote_campaign_contact.updatedBy'
    }
  }], {
    clientCollection: 'contact-campaigns-client'
  })
})

// Returns a status counts for all campaigns a contact is on
Meteor.publish('contact-campaign-statuses', function (contactSlug) {
  if (!this.userId) {
    return this.ready()
  }

  const group = Object.keys(StatusMap).reduce((group, status) => {
    group[status] = {
      $sum: {
        $cond: [{
          $eq: ['$remote_campaign_contact.status', StatusMap[status]]
        }, 1, 0]
      }
    }

    return group
  }, {
    _id: '$_id'
  })

  const project = Object.keys(StatusMap).reduce((project, status) => {
    project[StatusMap[status]] = `$${status}`

    return project
  }, {
    contact: {
      '$literal': contactSlug
    }
  })

  ReactiveAggregate(this, Contacts, [{
    $match: {
      slug: contactSlug
    }
  }, {
    // only keep slug and campaign list
    $project: {
      contact: '$slug',
      campaigns: 1
    }
  }, {
    // one document per campaign
    $unwind: '$campaigns'
  }, {
    // fetch campaign details
    $lookup: {
      from: 'campaigns',
      localField: 'campaigns',
      foreignField: 'slug',
      as: 'remote_campaign'
    }
  }, {
    // make campaign not an array
    $unwind: {
      path: '$remote_campaign'
    }
  }, {
    // filter campaign contacts so only this contact is present
    $project: {
      contact: '$contact',
      remote_campaign_contact: {
        $filter: {
          input: '$remote_campaign.contacts',
          as: 'campaignContact',
          cond: {
            $eq: ['$$campaignContact.slug', contactSlug]
          }
        }
      }
    }
  }, {
    // make campaign contacts not an array
    $unwind: {
      path: '$remote_campaign_contact'
    }
  }, {
    // group by status
    $group: group
  }, {
    // rename fields
    $project: project
  }], {
    clientCollection: 'contact-campaign-statuses-client'
  })
})
