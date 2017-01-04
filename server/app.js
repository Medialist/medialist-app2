App.medialistUpdated = function (medialistSlug, userId) {
  var user = Meteor.users.findOne(userId)
  if (!user) throw new Meteor.Error('unknown-user', 'Medialist cannot be updated by an unknown user')
  return Medialists.update({slug: medialistSlug}, {$set: {
    'updatedBy._id': user._id,
    'updatedBy.name': user.profile.name,
    'updatedBy.avatar': user.services.twitter.profile_image_url_https,
    'updatedAt': new Date()
  }})
}

App.contactUpdated = function (contactSlug, userId) {
  var user = Meteor.users.findOne(userId)
  if (!user) throw new Meteor.Error('unknown-user', 'Contact cannot be updated by an unknown user')
  return Contacts.update({slug: contactSlug}, {$set: {
    'updatedBy._id': user._id,
    'updatedBy.name': user.profile.name,
    'updatedBy.avatar': user.services.twitter.profile_image_url_https,
    'updatedAt': new Date()
  }})
}

Meteor.startup(() => ContactsTask.periodicallyUpdate())
