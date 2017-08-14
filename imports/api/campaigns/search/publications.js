import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import Campaigns from '/imports/api/campaigns/campaigns'
import publishToCollection from '/imports/lib/publish-to-collection'
import createCampaignSearchQuery from './create-query'

// Putting this here as it's used by the publications below.
export const CampaignSearchSchema = new SimpleSchema({
  excludeSlugs: {
    type: Array,
    optional: true
  },
  'excludeSlugs.$': {
    type: String
  },
  term: {
    type: String,
    optional: true
  },
  tagSlugs: {
    type: Array,
    optional: true
  },
  'tagSlugs.$': {
    type: String
  },
  masterListSlug: {
    type: String,
    optional: true
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  contactSlug: {
    type: String,
    optional: true
  },
  minSearchLength: {
    type: Number,
    optional: true
  }
})

Meteor.publish('campaign-search-results', function ({sort, limit, ...campaignSearch}) {
  if (!this.userId) {
    return this.ready()
  }
  CampaignSearchSchema.validate(campaignSearch)

  const query = createCampaignSearchQuery(campaignSearch)

  const cursor = Campaigns.find(query, {sort, limit})

  publishToCollection(this, 'campaign-search-results', cursor)
})

Meteor.publish('campaign-search-count-not-reactive', function (campaignSearch) {
  if (!this.userId) {
    return this.ready()
  }
  CampaignSearchSchema.validate(campaignSearch)

  const query = createCampaignSearchQuery(campaignSearch)

  const count = Campaigns.find(query).count()

  const sub = this
  // Always use the same _id, so it's replaced on the client.
  sub.added('campaign-search-count', 'campaign-search-count-id', {count: count})

  sub.ready()
})
