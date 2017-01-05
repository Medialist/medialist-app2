Meteor.methods({

  'medialists/create': function (medialist) {
    if (!this.userId) throw new Meteor.Error('Only a logged-in user can create a medialist')
    var user = Meteor.users.findOne(this.userId)
    if (typeof medialist !== 'object') throw new Meteor.Error('You must supply a medialist object')
    if (!medialist.client || !medialist.client.name) throw new Meteor.Error('A client\'s name cannot be blank')

    medialist.createdAt = new Date()
    medialist.createdBy = {
      _id: user._id,
      name: user.profile.name,
      avatar: user.services.twitter.profile_image_url_https
    }
    medialist.updatedAt = new Date()
    medialist.updatedBy = {
      _id: user._id,
      name: user.profile.name,
      avatar: user.services.twitter.profile_image_url_https
    }
    medialist.contacts = medialist.contacts || {}
    medialist.slug = App.uniqueSlug(App.cleanSlug(medialist.name), Medialists)

    var client = Clients.findOne({ name: medialist.client.name })
    if (client) {
      medialist.client._id = client._id
    } else {
      medialist.client._id = Clients.insert({ name: medialist.client.name })
    }

    check(medialist, Schemas.Medialists)

    _.each(_.keys(medialist.contacts), function (contactSlug) {
      if (!Contacts.find({slug: contactSlug}).count()) throw new Meteor.Error(`Contact # ${contactSlug} does not exist`)
      Contacts.update({ slug: contactSlug }, { $push: { medialists: medialist.slug } })
      Posts.createMedialistChange({
        contact: contactSlug,
        medialistSlug: medialist.slug,
        action: 'added'
      })
    })

    const medialistId = Medialists.insert(medialist)
    Meteor.users.update({ _id: user._id }, { $push: { myMedialists: {
      _id: medialistId,
      name: medialist.name,
      slug: medialist.slug,
      avatar: medialist.avatar,
      clientName: medialist.client.name,
      updatedAt: new Date()
    } } })
    return medialist.slug
  },

  'medialists/toggle-favourite': function (medialistSlug) {
    if (!this.userId) throw new Meteor.Error('Only a logged-in user can (un)favourite a medialist')
    const user = Meteor.users.findOne(this.userId, { fields: { profile: 1 } })
    check(medialistSlug, String)
    const medialist = Medialists.findOne({ slug: medialistSlug }, { fields: { image: 1, slug: 1, name: 1, client: 1 }})
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
