import { Meteor } from 'meteor/meteor'

Meteor.methods({

  'medialists/toggle-favourite': function (medialistSlug) {
    const user = Meteor.user()
    if (!this.userId) throw new Meteor.Error('Only a logged-in user can (un)favourite a medialist')
    const medialist = Medialists.findOne({ slug: medialistSlug }, { fields: { image: 1, slug: 1, name: 1, client: 1 }})
    if (!medialist) throw new Meteor.Error('Cannot find medialist')

    if (user.profile.medialists.some((m) => m._id === medialist._id)) {
      return Meteor.users.update(this.userId, { $pull: { 'profile.medialists': { _id: medialist._id } } })
    }
    return Meteor.users.update(this.userId, { $push: { 'profile.medialists': {
      _id: medialist._id,
      name: medialist.name,
      slug: medialist.slug,
      avatar: medialist.avatar,
      clientName: medialist.client.name,
      updatedAt: new Date()
    } } })
  }

})
