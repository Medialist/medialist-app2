import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import { check, Match } from 'meteor/check'
import nothing from '/imports/lib/nothing'
import { MasterListRefSchema } from '/imports/api/master-lists/master-lists'
import { UserRefSchema } from '/imports/api/users/users'
import { TagRefSchema } from '/imports/api/tags/tags'

const Campaigns = new Mongo.Collection('campaigns')

if (Meteor.isServer) {
  Campaigns._ensureIndex({ slug: 1 })
}

Campaigns.allow(nothing)

export default Campaigns

Campaigns.allCampaignsCount = () => Counter.get('campaignCount')

Campaigns.toRef = ({_id, slug, name, avatar, client}) => ({
  _id,
  slug,
  name,
  avatar,
  clientName: client ? client.name : ''
})

Campaigns.findRefs = ({campaignSlugs}) => {
  return Campaigns.find(
    { slug: { $in: campaignSlugs } },
    { fields: { _id: 1, slug: 1, name: 1, avatar: 1, client: 1 } }
  ).map(Campaigns.toRef)
}

Campaigns.search = (opts) => {
  opts = opts || {}

  check(opts, {
    regex: Match.Optional(String),
    masterListSlug: Match.Optional(String),
    userId: Match.Optional(String),
    limit: Match.Optional(Number)
  })

  const query = {}

  if (opts.masterListSlug) {
    query['masterLists.slug'] = opts.masterListSlug
  }

  if (opts.userId) {
    const user = Meteor.users.findOne({_id: opts.userId}, {fields: { myCampaigns: 1 }})
    if (!user) {
      console.log(`'contacts' publication failed to find user for provided userId ${opts.userId}`)
      return null
    }
    query.slug = { $in: user.myCampaigns.map((c) => c.slug) }
  }

  if (opts.regex) {
    const filterRegExp = new RegExp(opts.regex, 'gi')
    query.$or = [
      { name: filterRegExp },
      { purpose: filterRegExp },
      { 'client.name': filterRegExp }
    ]
  }

  const options = {
    sort: { createdAt: -1 },
    limit: opts.limit || 100
  }

  return Campaigns.find(query, options)
}

export const CampaignRefSchema = new SimpleSchema([
  {
    slug: { type: String },
    name: { type: String },
    avatar: {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    },
    clientName: {
      type: String,
      optional: true
    }
  }
])

export const MedialistSchema = new SimpleSchema({
  'createdBy._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  'createdBy.name': {
    type: String
  },
  'createdBy.avatar': {
    type: String
  },
  createdAt: {
    type: Date
  },
  'updatedBy._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  'updatedBy.name': {
    type: String
  },
  'updatedBy.avatar': {
    type: String
  },
  updatedAt: {
    type: Date
  },
  name: {
    type: String,
    min: 1
  },
  avatar: {
    type: String,
    optional: true
  },
  purpose: {
    type: String,
    min: 1,
    optional: true
  },
  slug: {
    type: String
  },
  contacts: {
    type: Object,
    blackbox: true
  },
  'client._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  'client.name': {
    type: String,
    min: 1,
    optional: true
  },
  topics: {
    type: [String],
    optional: true
  },
  masterLists: {
    type: [MasterListRefSchema]
  },
  tags: {
    type: [TagRefSchema]
  },
  team: {
    type: [UserRefSchema]
  },
  links: {
    type: [Object],
    optional: true
  },
  'links.$.url': {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  }
})

export const MedialistUpdateSchema = new SimpleSchema({
  '_id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  name: {
    type: String,
    min: 1,
    optional: true
  },
  clientName: {
    type: String,
    min: 1,
    optional: true
  },
  purpose: {
    type: String,
    optional: true
  },
  links: {
    type: [Object],
    optional: true
  },
  'links.$.url': {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  },
  avatar: {
    type: String,
    optional: true
  }
})

export const MedialistCreateSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1,
    label: 'campaign name'
  },
  clientName: {
    type: String,
    optional: true
  },
  purpose: {
    type: String,
    optional: true
  },
  links: {
    type: [Object],
    optional: true
  },
  'links.$.url': {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  },
  avatar: {
    type: String,
    optional: true
  }
})

export const MedialistAddTeamMatesSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  userIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id
  }
})

export const MedialistRemoveTeamMateSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  userId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
})