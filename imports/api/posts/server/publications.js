import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import Posts from '/imports/api/posts/posts'
import { findPinnedNeedToKnows } from '/imports/api/posts/queries'

Meteor.publish('posts', function (opts) {
  if (!this.userId) {
    return this.ready()
  }

  opts = opts || {}
  check(opts, {
    campaign: Match.Optional(String),
    contact: Match.Optional(String),
    message: Match.Optional(Boolean),
    types: Match.Optional([String]),
    limit: Match.Optional(Number)
  })

  const query = {}

  if (opts.campaign) {
    query['campaigns._id'] = opts.campaign
  }

  if (opts.contact) {
    query['contacts._id'] = opts.contact
  }

  if (opts.message) {
    query.message = {
      $exists: true
    }
  }

  if (opts.types) {
    query.type = {
      $in: opts.types
    }
  }

  const options = {
    sort: {
      createdAt: -1
    },
    limit: opts.limit || 1
  }

  return Posts.find(query, options)
})

Meteor.publish('pinned-need-to-knows', function (contactSlug, opts) {
  if (!this.userId) return this.ready()
  return findPinnedNeedToKnows(contactSlug, opts)
})
