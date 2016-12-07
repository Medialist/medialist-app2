
// TODO: reafactor to return _ids of created and updated users, so we can do batch actions on them. Or use the tag?

Meteor.methods({
  'contacts/import' (contacts) {
    if (!this.userId) throw new Meteor.Error('Only a logged in user can import contacts')
    this.unblock()

    var user = Meteor.users.findOne(this.userId)

    check(contacts, [{
      emails: Match.Optional([{label: String, value: String}]),
      socials: Match.Optional([{label: String, value: String}]),
      phones: Match.Optional([{label: String, value: String}]),
      name: Match.Optional(String),
      address: Match.Optional(String),
      primaryOutlets: Match.Optional(String),
      otherOutlets: Match.Optional(String),
      sectors: Match.Optional(String),
      jobTitles: Match.Optional(String),
      languages: Match.Optional(String)
    }])

    console.log(`Importing ${contacts.length} contacts`)

    var results = {created: 0, updated: 0}

    contacts.forEach(contactData => {
      if (contactData.emails && contactData.emails.length) {
        var emails = contactData.emails.map(e => e.value)
        var contact = Contacts.findOne({'emails.value': {$in: emails}})

        if (contact) {
          mergeContact(contactData, contact, user)
          results.updated++
        } else {
          createContact(contactData, user)
          results.created++
        }
      } else {
        createContact(contactData, user)
        results.created++
      }
    })

    return results
  }
})

function createContact (data, user) {
  console.log(`Creating contact ${data.name}`)

  data.name = data.name || 'Unknown'
  data.emails = data.emails || []
  data.socials = data.socials || []
  data.phones = data.phones || []

  data.avatar = '/images/avatar.svg'
  data.slug = App.cleanSlug(data.name)
  data.slug = App.uniqueSlug(data.slug, Contacts)
  data.medialists = []

  data.createdAt = new Date()
  data.createdBy = {
    _id: user._id,
    name: user.profile.name,
    avatar: user.services.twitter.profile_image_url_https
  }
  data.updatedAt = data.createdAt
  data.updatedBy = data.createdBy

  check(data, Schemas.Contacts)

  var id = Contacts.insert(data)
  ContactsTask.queueUpdate(id)
}

function mergeContact (data, contact, user) {
  console.log(`Merging contact ${data.name}`)

  ;['emails', 'socials', 'phones'].forEach(key => {
    contact[key] = mergeLabelValueLists(contact[key], data[key])
  })

  ;[
    'name',
    'address',
    'primaryOutlets',
    'otherOutlets',
    'sectors',
    'jobTitles',
    'languages'
  ].forEach(key => {
    if (!contact[key] && data[key]) {
      contact[key] = data[key]
    }
  })

  contact.createdAt = moment(contact.createdAt).toDate()

  contact.updatedAt = new Date()
  contact.updatedBy = {
    _id: user._id,
    name: user.profile.name,
    avatar: user.services.twitter.profile_image_url_https
  }

  var id = contact._id
  delete contact._id

  check(contact, Schemas.Contacts)

  Contacts.update({_id: id}, {$set: contact})
  ContactsTask.queueUpdate(id)
}

function mergeLabelValueLists (oldList, newList) {
  oldList = oldList || []
  newList = newList || []

  var newItems = newList.reduce((list, newItem) => {
    var newValue = newItem.value.toLowerCase()
    var exists = oldList.some(oldItem => oldItem.value.toLowerCase() === newValue)
    return exists ? list : list.concat(newItem)
  }, [])

  return oldList.concat(newItems)
}
