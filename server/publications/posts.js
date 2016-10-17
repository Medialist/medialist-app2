Meteor.publish('posts', function (opts) {
  if (!this.userId) return this.ready()
  opts = opts || {}
  check(opts, {
    medialist: Match.Optional(String),
    contact: Match.Optional(String),
    message: Match.Optional(Boolean),
    types: Match.Optional([String]),
    limit: Match.Optional(Number)
  })

  var query = {}
  if (opts.medialist) query.medialists = opts.medialist
  if (opts.contact) query['contacts.slug'] = opts.contact
  if (opts.message) query.message = { $exists: true }

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
    'type': { $in: [
      'need to know',
      'details changed',
      'medialists changed'
    ] }
  }
  var options = {
    sort: { createdAt: -1 },
    limit: opts.limit || 1
  }

  return Posts.find(query, options)
})
