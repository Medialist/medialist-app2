Meteor.publish(null, function () {
  if (!this.userId) return this.ready()

  return Meteor.users.find(
    {_id: this.userId},
    {fields: {'services.twitter.profile_image_url_https': 1, myMedialists: 1, myContacts: 1}}
  )
})

Meteor.publish('teamMates', function () {
  if (!this.userId) return this.ready()

  return Meteor.users.find({}, {
    fields: {
      'services.twitter.profile_image_url_https': 1,
      'profile.name': 1
    }
  })
})
