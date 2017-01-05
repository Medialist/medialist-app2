Meteor.publish(null, function () {
  if (!this.userId) return this.ready()

  return Meteor.users.find(
    {_id: this.userId},
    {fields: {'services.twitter.profile_image_url_https': 1, 'profile.name': 1}}
  )
})
