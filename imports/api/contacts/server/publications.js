import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import { ContactSearchSchema } from '/imports/api/contacts/schema'
import StatusMap from '/imports/api/contacts/status'
import { createContactSearchQuery } from '/imports/api/contacts/queries'
import publishToCollection from '/imports/lib/publish-to-collection'
import { getMongoCollationOpts } from '/imports/lib/collation'

const contactCounter = new Counter('contactCount', Contacts.find({}), 3000)

Meteor.publish('contactCount', function () {
  return contactCounter
})

Meteor.publish('recent-contacts-and-campaigns', function () {
  if (!this.userId) {
    return this.ready()
  }

  return [
    Contacts.find({}, { sort: { updatedAt: -1 }, limit: 20 }),
    Campaigns.find({}, { sort: { updatedAt: -1 }, limit: 20 })
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
    // one document per campaign
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
      client: { name: '$remote_campaign.client.name' },
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

Meteor.publish('contact-search-results', function ({sort, limit, ...contactSearch}) {
  if (!this.userId) {
    return this.ready()
  }
  ContactSearchSchema.validate(contactSearch)

  const query = createContactSearchQuery(contactSearch)

  if (sort && sort.hasOwnProperty('updatedAt')) {
    // reactive: will publish changes as they happen.
    const cursor = Contacts.find(query, {sort, limit})
    publishToCollection(this, 'contact-search-results', cursor)
  } else {
    // non-reactive: result set won't change until you re-subscribe
    const sub = this

    const rawCursor = Contacts.rawCollection()
      .find(query)
      .sort(sort)
      .limit(limit)
      .collation(getMongoCollationOpts())

    const addToSub = Meteor.wrapAsync(function (cb) {
      rawCursor.forEach(
        doc => sub.added('contact-search-results', doc._id, doc),
        cb
      )
    })

    addToSub(err => {
      if (err) return sub.error(err)
      sub.ready()
    })
  }
})

Meteor.publish('contact-search-count-not-reactive', function (contactSearch) {
  if (!this.userId) {
    return this.ready()
  }
  ContactSearchSchema.validate(contactSearch)

  const query = createContactSearchQuery(contactSearch)

  const count = Contacts.find(query).count()

  const sub = this
  // Always use the same _id, so it's replaced on the client.
  sub.added('contact-search-count', 'contact-search-count-id', {count: count})

  sub.ready()
})
