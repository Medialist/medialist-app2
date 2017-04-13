import { Meteor } from 'meteor/meteor'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import { publishAllForLoggedInUser } from '/imports/lib/publish-all'
import * as Queries from '../queries'

publishAllForLoggedInUser(Queries)

const campaignCounter = new Counter('campaignCount', Campaigns.find({}))

Meteor.publish('campaignCount', function () {
  return campaignCounter
})

// TODO: replace with campaign-search for filter dropdown.
Meteor.publish('campaign-refs', function () {
  return Campaigns.find(
    {},
    { fields: { _id: 1, slug: 1, name: 1, avatar: 1, client: 1, contacts: 1 } }
  )
})

Meteor.publish('campaigns-by-slug', function (slugs) {
  if (!this.userId) return this.ready()
  return Campaigns.find({ slug: { $in: slugs } })
})

Meteor.publish('campaign', function (slug) {
  if (!this.userId) return []
  return [
    Campaigns.find({ slug: slug }),
    Contacts.find({ campaigns: slug }, { fields: { importedData: 0 } })
  ]
})

Meteor.publish('campaign-favourites', function () {
  if (!this.userId) return []
  return Campaigns.find({}, { limit: 7, sort: [['createdAt', 'desc']] })
})
