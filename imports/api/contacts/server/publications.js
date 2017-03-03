import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from './contacts'
import { publishAllForLoggedInUser } from '/imports/lib/publish-all'
import * as Queries from '../queries'

publishAllForLoggedInUser(Queries)

const contactCounter = new Counter('contactCount', Contacts.find({}), 3000)

Meteor.publish('contactCount', function () {
  return contactCounter
})

Meteor.publish('my-contacts-and-campaigns', function () {
  if (!this.userId) return this.ready()
  return [
    Contacts.find({}, { sort: { updatedAt: -1 }, limit: 20 }),
    Campaigns.find({}, { sort: { updatedAt: -1 }, limit: 20 })
  ]
})

Meteor.publish('contact-page', function (slug) {
  if (!this.userId) return this.ready()
  check(slug, String)
  return [
    Contacts.find({ slug }, { fields: { importedData: 0 } }),
    Campaigns.find({ [`contact.${slug}`]: { $exists: true } })
  ]
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
