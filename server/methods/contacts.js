Meteor.methods({

  'contacts/remove': function (contactIds) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can remove a contact')
    check(contactIds, Array)
    Meteor.users.update({ 'myContacts._id': { $in: contactIds } }, { $pull: { myContacts: { _id: { $in: contactIds } } } })
    return Contacts.remove({_id: {$in: contactIds}})
  },

  'contacts/create': function (details, medialistSlug) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can create a contact')
    check(details, Object)
    if (medialistSlug) {
      check(medialistSlug, String)
      if (!Medialists.find({slug: medialistSlug}).count()) throw new Meteor.Error('Medialist #' + medialistSlug + ' does not exist')
    }

    // return if a matching twitter handle already exists
    var existingContact = details.twitter && Contacts.findOne({ 'socials.label': 'Twitter', 'socials.value': details.twitter })
    if (existingContact) return existingContact

    var user = Meteor.user()
    var contact = {
      name: details.name,
      slug: App.uniqueSlug(details.twitter || App.cleanSlug(details.name), Contacts),
      avatar: '/images/avatar.svg',
      bio: '',
      outlets: details.outlets,
      sectors: '',
      masterLists: [],
      languages: 'English',
      emails:  [{label: Contacts.emailTypes[0], value: details.email}],
      phones:  [{label: Contacts.phoneTypes[0], value: details.phone}],
      socials: [{label: 'Twitter', value: details.twitter}],
      medialists: [],
      createdAt: new Date(),
      createdBy: {
        _id: user._id,
        name: user.profile.name,
        avatar: user.services.twitter.profile_image_url_https
      }
    }
    contact.updatedAt = contact.createdAt
    contact.updatedBy = contact.createdBy

    if (medialistSlug) contact.medialists.push(medialistSlug)

    // Save the contact
    check(contact, Schemas.Contacts)
    var contactId = Contacts.insert(contact)

    if (medialistSlug) {
      var updateMedialist = {}
      updateMedialist['contacts.' + contact.slug] = Contacts.status.toContact
      Medialists.update({ slug: medialistSlug }, {$set: updateMedialist})
      App.medialistUpdated(medialistSlug, this.userId)
    }

    return (details.twitter ? Contacts.changeScreenName(contactId, details.twitter) : Promise.resolve())
      .then(() => {
        const contact = Contacts.findOne(contactId)
        Meteor.users.update({ _id: this.userId }, { $push: { 'myContacts': {
          _id: contactId,
          slug: contact.slug,
          avatar: contact.avatar,
          name: contact.name,
          outlets: contact.outlets,
          updatedAt: new Date()
        } } })
        return contact
      })
  },

  'contacts/addToMedialist': function (contactSlugs, medialistSlug) {
    if (typeof contactSlugs === 'string') contactSlugs = [contactSlugs]
    check(contactSlugs, [String])
    check(medialistSlug, String)
    if (!Medialists.find({slug: medialistSlug}).count()) throw new Meteor.Error('Medialist #' + medialistSlug + ' does not exist')
    if (!this.userId) throw new Meteor.Error('Only a logged in user can add contacts to a medialist')
    var set = {}

    _.each(contactSlugs, function (contactSlug) {
      var contact = Contacts.findOne({slug: contactSlug})
      if (!contact) throw new Meteor.Error('Contact #' + contactSlug + ' does not exist')
      set['contacts.' + contactSlug] = Contacts.status.toContact
      if (contact.medialists.indexOf(medialistSlug) === -1) Contacts.update({ slug: contactSlug }, { $push: { medialists: medialistSlug } })
      Posts.createMedialistChange({
        contact,
        medialistSlug,
        action: 'added'
      })
      App.contactInteracted(contactSlug, this.userId)
    })

	  App.medialistUpdated(medialistSlug, this.userId)
    return Medialists.update({
      slug: medialistSlug
    }, {
      $set: set
    })
  },

  'contacts/removeFromMedialist': function (contactSlugs, medialistSlug) {
    if (typeof contactSlugs === 'string') contactSlugs = [contactSlugs]
    check(contactSlugs, [String])
    check(medialistSlug, String)
    if (!Medialists.find({slug: medialistSlug}).count()) throw new Meteor.Error('Medialist #' + medialistSlug + ' does not exist')
    if (!this.userId) throw new Meteor.Error('Only a logged in user can add contacts to a medialist')
    var unset = {}

    _.each(contactSlugs, function (contactSlug) {
      var contact = Contacts.findOne({slug: contactSlug})
      if (!contact) throw new Meteor.Error('Contact #' + contactSlug + ' does not exist')
      unset['contacts.' + contactSlug] = true
      Contacts.update({ slug: contactSlug }, { $pull: { medialists: medialistSlug } })
      Posts.createMedialistChange({
        contact,
        medialistSlug,
        action: 'removed'
      })
    })

    App.medialistUpdated(medialistSlug, this.userId)
    return Medialists.update({
      slug: medialistSlug
    }, {
      $unset: unset
    })
  },

  'contacts/addDetails': function (contactSlug, outlet) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can add roles to a contact')
    check(contactSlug, String)
    check(outlet, { label: String, value: String })
    var user = Meteor.users.findOne(this.userId)
    if (!Contacts.find({slug: contactSlug}).count()) throw new Meteor.Error('Contact #' + contactSlug + ' does not exist')

    var org = Orgs.findOne({ name: outlet.label })
    if (!org) {
      Orgs.insert({ name: outlet.label })
    }
    check(details, Schemas.ContactDetails)
    const updateSet = {
      'updatedBy._id': user._id,
      'updatedBy.name': user.profile.name,
      'updatedBy.avatar': user.services.twitter.profile_image_url_https,
      'updatedAt': new Date()
    }
    App.contactInteracted(contactSlug, this.userId)
    
    return Contacts.update({ slug: contactSlug }, { $set: updateSet, $push: { outlets: outlet } })
  },

  'contacts/setLabel': function (contactSlug, type, index, newLabel) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can add roles to a contact')
    if (['email', 'phone', 'social'].indexOf(type) < 0) throw new Meteor.Error('Bad type', type)
    if (Contacts[type + 'Types'].indexOf(newLabel) < 0) throw new Meteor.Error('Bad label', newLabel)
    checkContactSlug(contactSlug)
    check(index, Match.Integer)
    var prop = type + 's'
    var key = [prop, index, 'label'].join('.')
    var query = {}
    query[key] = newLabel
    App.contactInteracted(contactSlug, this.userId)

    return Contacts.update({ slug: contactSlug }, { $set: query })
  },

  'contacts/deleteType': function (contactSlug, type, item) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can add roles to a contact')
    if (['email', 'phone', 'social'].indexOf(type) < 0) throw new Meteor.Error('Bad type', type)
    checkContactSlug(contactSlug)
    check(item, {label: String, value: String})
    var prop = type + 's'
    var query = { $pull: {} }
    query.$pull[prop] = item
    App.contactInteracted(contactSlug, this.userId)

    return Contacts.update({ slug: contactSlug }, query)
  },

  'contacts/addPhone': function (contactSlug) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can add roles to a contact')
    checkContactSlug(contactSlug)
    var item = { label: Contacts.phoneTypes[0], value:'' }
    App.contactInteracted(contactSlug, this.userId)

    return Contacts.update({ slug: contactSlug }, { $push: { phones: item }})
  },

  'contacts/addEmail': function (contactSlug) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can add roles to a contact')
    checkContactSlug(contactSlug)
    var item = { label: Contacts.emailTypes[0], value:'' }
    App.contactInteracted(contactSlug, this.userId)

    return Contacts.update({ slug: contactSlug }, { $push: { emails: item }})
  },

  'contacts/addSocial': function (contactSlug) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can add roles to a contact')
    checkContactSlug(contactSlug)
    var item = { label: Contacts.socialTypes[1], value:''}
    App.contactInteracted(contactSlug, this.userId)

    return Contacts.update({ slug: contactSlug }, { $push: { socials: item }})
  },

  // The client is just letting us know there is some work to do, they don't care about the response.
  'contacts/updateAvatar': function (contactSlug) {
    if (!this.userId) throw new Meteor.Error('Only logged in users can request avatar updates')
    check(contactSlug, String)
    // Can we still see their avatar?
    var contact = Contacts.findOne({slug: contactSlug}, {fields: {avatar: 1}})

    if (!contact) return
    App.contactInteracted(contactSlug, this.userId)

    HTTP.get(contact.avatar, err => {
      if (!err) return // avatar is fine. ignore.
      ContactsTask.queueUpdate(contact._id)
    })
  }
})

function checkContactSlug (contactSlug) {
  check(contactSlug, String)
  if (!Contacts.find({slug: contactSlug}).count()) throw new Meteor.Error('Contact #' + contactSlug + ' does not exist')
}
