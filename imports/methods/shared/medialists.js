import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'

const Medialists = (typeof window === 'undefined') ? global.Medialists : window.Medialists

Meteor.methods({
  'medialists/toggle-favourite': function (medialistSlug) {
    if (!this.userId) throw new Meteor.Error('Only a logged-in user can (un)favourite a medialist')
    const user = Meteor.users.findOne(this.userId, { fields: { myMedialists: 1 } })
    check(medialistSlug, String)
    const medialist = Medialists.findOne({ slug: medialistSlug }, { fields: { image: 1, slug: 1, name: 1, client: 1 } })
    if (!medialist) throw new Meteor.Error('Cannot find medialist')

    if (user.myMedialists.some((m) => m._id === medialist._id)) {
      return Meteor.users.update(this.userId, { $pull: { myMedialists: { _id: medialist._id } } })
    }
    return Meteor.users.update(this.userId, { $push: { myMedialists: {
      _id: medialist._id,
      name: medialist.name,
      slug: medialist.slug,
      avatar: medialist.avatar,
      clientName: medialist.client.name,
      updatedAt: new Date()
    } } })
  }
})
