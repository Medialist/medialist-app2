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
    Contacts.find({}, { sort: { updatedAt: -1 }, limit: 2000 }),
    Campaigns.find({}, { sort: { updatedAt: -1 }, limit: 1 })
  ]
})

Meteor.publish('contacts-search', function (opts) {
  if (!this.userId) return this.ready()
  check(opts, {
    term: Match.Optional(String),
    campaignSlugs: Match.Optional(Array),
    masterListSlug: Match.Optional(String),
    userId: Match.Optional(String),
    sort: Match.Optional(Object),
    limit: Match.Optional(Number)
  })
  const cursors = [Contacts.search(opts)]
  if (opts.userId) {
    cursors.push(Meteor.users.find(
      {_id: opts.userId},
      {fields: {_id: 1, myContacts: 1}}
    ))
  }
  return cursors
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
