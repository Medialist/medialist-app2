import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from './contacts'

const contactCounter = new Counter('contactCount', Contacts.find({}), 3000)

Meteor.publish('contactCount', function () {
  return contactCounter
})

Meteor.publish('my-contacts-and-campaigns', function () {
  if (!this.userId) return this.ready()
  return [
    Contacts.find({}, { sort: { updatedAt: -1 }, limit: 100 }),
    Campaigns.find({}, { sort: { updatedAt: -1 }, limit: 10 })
  ]
})

Meteor.publish('contacts', function (opts) {
  if (!this.userId) return this.ready()

  opts = opts || {}
  check(opts, {
    regex: Match.Optional(String),
    campaignSlugs: Match.Optional(Array),
    masterListSlug: Match.Optional(String),
    userId: Match.Optional(String),
    limit: Match.Optional(Number)
  })

  var query = {}

  if (opts.campaignSlugs) {
    query.campaigns = {
      $in: opts.campaignSlugs
    }
  }

  if (opts.masterListSlug) {
    query['masterLists.slug'] = opts.masterListSlug
  }

  if (opts.userId) {
    const user = Meteor.users.findOne({_id: opts.userId}, {fields: { myContacts: 1 }})
    if (!user) {
      console.log(`'contacts' publication failed to find user for provided userId ${opts.userId}`)
      return this.ready()
    }
    query.slug = { $in: user.myContacts.map((c) => c.slug) }
  }

  if (opts.regex) {
    var regex = new RegExp(opts.regex, 'gi')
    query = { $or: [
      { name: regex },
      { 'outlets.value': regex },
      { 'outlets.label': regex }
    ]}
  }

  var options = {
    sort: { createdAt: -1 },
    fields: { importedData: 0 }
  }

  if (opts.limit) {
    options.limit = opts.limit
  }
  return Contacts.find(query, options)
})

Meteor.publish('contact', function (slug) {
  if (!this.userId) return this.ready()
  check(slug, String)
  return Contacts.find({ slug }, { fields: { importedData: 0 } })
})

Meteor.publish('contacts-by-campaign', function (campaignSlug, limit) {
  if (!this.userId) return this.ready()
  check(campaignSlug, String)
  const opts = { sort: { updatedAt: -1 }, fields: { importedData: 0 } }
  if (limit) {
    check(limit, Number)
    opts.limit = limit
  }
  return Contacts.find({ campaigns: campaignSlug }, opts)
})
