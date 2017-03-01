import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import Posts from '../posts'

Meteor.publish('posts', function (opts) {
  if (!this.userId) return this.ready()
  opts = opts || {}
  check(opts, {
    campaignSlug: Match.Optional(String),
    contactSlug: Match.Optional(String),
    message: Match.Optional(Boolean),
    types: Match.Optional([String]),
    limit: Match.Optional(Number)
  })

  var query = {}
  if (opts.campaignSlug) query['campaigns.slug'] = opts.campaignSlug
  if (opts.contactSlug) query['contacts.slug'] = opts.contactSlug
  if (opts.message) query.message = { $exists: true }
  if (opts.types) query.type = { $in: opts.types }

  var options = {
    sort: { createdAt: -1 },
    limit: opts.limit || 1
  }

  return Posts.find(query, options)
})

Meteor.publish('need-to-knows', function (opts) {
  if (!this.userId) return this.ready()
  check(opts, {
    contact: String,
    limit: Match.Optional(Number)
  })

  var query = {
    'contacts.slug': opts.contact,
    'type': 'NeedToKnowPost'
  }

  var options = {
    sort: { createdAt: -1 }
  }
  if (opts.limit) {
    options.limit = opts.limit
  }

  return Posts.find(query, options)
})
