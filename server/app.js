App.medialistUpdated = function (medialistSlug, userId) {
  var user = Meteor.users.findOne(userId)
  if (!user) throw new Meteor.Error('unknown-user', 'Medialist cannot be updated by an unknown user')
  const medialist = Medialists.findOne({ slug: medialistSlug }, { fields: { name: 1, avatar: 1, slug: 1, client: 1 } })
  if (!medialist) throw new Meteor.Error('unknown-medialist', 'Cannot find medialist')

  if (Meteor.users.find({ _id: userId, 'myMedialists._id': medialist._id }).count()) {
    Meteor.users.update({ _id: userId, 'myMedialists._id': medialist._id }, { $set: { 'myMedialists.$.updatedAt': new Date() } })
  } else {
    Meteor.users.update({ _id: userId }, { $push: { 'myMedialists': {
      _id: medialist._id,
      slug: medialist.slug,
      avatar: medialist.avatar,
      name: medialist.name,
      clientName: medialist.client.name,
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

// This method is called when a contact is updated and we want to record the fact on both the user doc and the contact doc
App.contactUpdated = function (contactSlug, userId) {
  var user = Meteor.users.findOne(userId)
  if (!user) throw new Meteor.Error('unknown-user', 'Contact cannot be updated by an unknown user')
  const contact = Contacts.findOne({ slug: contactSlug }, { fields: { name: 1, avatar: 1, slug: 1, outlets: 1 } })
  if (!contact) throw new Meteor.Error('unknown-contact', 'Cannot find contact')

  if (Meteor.users.find({ _id: userId, 'myContacts._id': contact._id }).count()) {
    Meteor.users.update({ _id: userId, 'myContacts._id': contact._id }, { $set: { 'myContacts.$.updatedAt': new Date() } })
  } else {
    Meteor.users.update({ _id: userId }, { $push: { 'myContacts': {
      _id: contact._id,
      slug: contact.slug,
      avatar: contact.avatar,
      name: contact.name,
      outlets: contact.outlets,
      updatedAt: new Date()
    } } })
  }

  return Contacts.update({slug: contactSlug}, {$set: {
    'updatedBy._id': user._id,
    'updatedBy.name': user.profile.name,
    'updatedBy.avatar': user.services.twitter.profile_image_url_https,
    'updatedAt': new Date()
  }})
}

// This method is called when a contact is interacted with and we want to record the fact only on the user doc (e.g. they've been added to a campaign)
App.contactInteracted = function (contactSlug, userId) {
  const contact = Contacts.findOne({ slug: contactSlug }, { fields: { name: 1, avatar: 1, slug: 1, outlets: 1 } })
  if (!contact) throw new Meteor.Error('unknown-contact', 'Cannot find contact')

  if (Meteor.users.find({ _id: userId, 'myContacts._id': contact._id }).count()) {
    Meteor.users.update({ _id: userId, 'myContacts._id': contact._id }, { $set: { 'myContacts.$.updatedAt': new Date() } })
  } else {
    Meteor.users.update({ _id: userId }, { $push: { 'myContacts': {
      _id: contact._id,
      slug: contact.slug,
      avatar: contact.avatar,
      name: contact.name,
      outlets: contact.outlets,
      updatedAt: new Date()
    } } })
  }
}

Meteor.startup(() => ContactsTask.periodicallyUpdate())
