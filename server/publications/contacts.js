Meteor.publish('contacts', function (opts) {
  if (!this.userId) return this.ready()

  opts = opts || {}
  check(opts, {
    regex: Match.Optional(String),
    limit: Match.Optional(Number)
  })

  var query = {}
  if (opts.regex) {
    var regex = new RegExp(opts.regex, 'gi')
    query = { $or: [
      { name: regex },
      { jobTitles: regex },
      { primaryOutlets: regex },
      { otherOutlets: regex }
    ]}
  }

  var options = {
    sort: { createdAt: -1 },
    fields: { importedData: 0 }
  }
  if (opts.limit)
  options.limit = opts.limit

  return Contacts.find(query, options)
})

Meteor.publish('contact', function (slug) {
  if (!this.userId) return this.ready()
  check(slug, String)
  return Contacts.find({ slug }, { fields: { importedData: 0 } })
})

Meteor.publish('contacts-by-campaign', function (campaignSlug) {
  if (!this.userId) return this.ready()
  check(campaignSlug, String)
  return Contacts.find({ medialists: campaignSlug }, { fields: { importedData: 0 } })
})
