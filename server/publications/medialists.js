Meteor.publish('medialists', function (opts) {
  if (!this.userId) return this.ready()
  return Medialists.search(opts)
})

Meteor.publish('medialists-by-slug', function (slugs) {
  if (!this.userId) return this.ready()
  return Medialists.find({ slug: { $in: slugs } })
})

Meteor.publish('medialist', function (slug) {
  if (!this.userId) return []
  return [
    Medialists.find({ slug: slug }),
    Contacts.find({ medialists: slug }, { fields: { importedData: 0 } })
  ]
})

Meteor.publish('medialist-favourites', function () {
  if (!this.userId) return []
  return Medialists.find({}, { limit:7, sort: [['createdAt', 'desc']] })
})
