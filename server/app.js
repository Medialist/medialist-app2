App.medialistUpdated = function (medialistSlug, userId) {
  var user = Meteor.users.findOne(userId)
  if (!user) throw new Meteor.Error('unknown-user', 'Medialist cannot be updated by an unknown user')
  const medialist = Medialists.findOne({ slug: medialistSlug }, { fields: { name: 1, image: 1, slug: 1 } })
  if (!medialist) throw new Meteor.Error('unknown-medialist', 'Cannot find medialist')

  if (Meteor.users.find({ _id: userId, 'profile.medialists._id': medialist._id }).count()) {
    Meteor.users.update({ _id: userId, 'profile.medialists._id': medialist._id }, { $set: { 'profile.medialists.$.updatedAt': new Date() } })
  } else {
    Meteor.users.update({ _id: userId }, { $push: { 'profile.medialists': {
      _id: medialist._id,
      slug: medialist.slug,
      image: medialist.image,
      name: medialist.name,
      updatedAt: new Date()
    } } })
  }

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
