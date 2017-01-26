import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { check, Match } from 'meteor/check'
import nothing from '/imports/lib/nothing'
import { MasterListRefSchema } from '/imports/api/master-lists/master-lists'
import { UserRefSchema } from '/imports/api/users/users'

const Medialists = new Mongo.Collection('medialists')

if (Meteor.isServer) {
  Medialists._ensureIndex({ slug: 1 })
}

Medialists.allow(nothing)

export default Medialists

Medialists.search = (opts) => {
  opts = opts || {}

  check(opts, {
    regex: Match.Optional(String),
    limit: Match.Optional(Number)
  })

  const query = {}

  if (opts.regex) {
    const regex = new RegExp(opts.regex, 'gi')
    query.$or = [
      { slug: regex },
      { name: regex }
    ]
  }

  const options = {
    sort: { createdAt: -1 },
    limit: opts.limit || 100
  }

  return Medialists.find(query, options)
}

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
