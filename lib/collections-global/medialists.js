Medialists = new Mongo.Collection('medialists')

if (Meteor.isServer) {
  Medialists._ensureIndex({
    'slug': 1
  })
}

Medialists.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
})

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
    type: [String]
  }
})
