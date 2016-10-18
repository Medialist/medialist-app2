import createSvgComponents from './lib/createSvgComponents'

App.medialistUpdated = function (medialistSlug, userId) {
  var user = Meteor.users.findOne(userId)
  if (!user) throw new Meteor.Error('unknown-user', 'Medialist cannot be updated by an unknown user')
  return Medialists.update({slug: medialistSlug}, {$set: {
    'updatedBy._id': user._id,
    'updatedBy.name': user.profile.name,
    'updatedAt': new Date()
  }})
}

Meteor.startup(() => {
  ContactsTask.periodicallyUpdate()
  createSvgComponents()
})
