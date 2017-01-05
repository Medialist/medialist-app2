import { Mongo } from 'meteor/mongo'
import nothing from '/imports/api/nothing'
import { MasterListRefSchema } from '/imports/api/master-lists'

Medialists = new Mongo.Collection('medialists')

if (Meteor.isServer) {
  Medialists._ensureIndex({
    'slug': 1
  })
}

Medialists.allow(nothing)

Medialists.search = opts => {
  opts = opts || {}
  check(opts, {
    regex: Match.Optional(String),
    limit: Match.Optional(Number)
  })
  var query = {}
  if (opts.regex) {
    var regex = new RegExp(opts.regex, 'gi')
    query.$or = [
      { slug: regex },
      { name: regex }
    ]
  }

  var options = {
    sort: { createdAt: -1 },
    limit: opts.limit || 100
  }

  return Medialists.find(query, options)
}

Schemas.Medialists = new SimpleSchema({
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
  purpose: {
    type: String,
    min: 1
  },
  slug: {
    type: String,
  },
  contacts: {
    type: Object,
    blackbox: true
  },
  'client._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  'client.name': {
    type: String,
    min: 1
  },
  topics: {
    type: [String],
    optional: true
  },
  masterLists: {
    type: [MasterListRefSchema]
  }
})
