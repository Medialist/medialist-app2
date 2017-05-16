import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import TwitterClient from '/imports/api/twitter-users/server/twitter-client'
import Contacts from '/imports/api/contacts/server/contacts'

const ContactsTask = {}

var contactUpdateQueue = []

function scheduleProcessContactUpdateQueue () {
  Meteor.setTimeout(processContactUpdateQueue, 60000)
}

scheduleProcessContactUpdateQueue()

function processContactUpdateQueue () {
  // We can only ask twitter for 100 user details at a time
  var ids = contactUpdateQueue.slice(0, 100)
  contactUpdateQueue = contactUpdateQueue.slice(100)

  if (!ids.length) return scheduleProcessContactUpdateQueue()

  var contacts = Contacts.find({_id: {$in: ids}}, {fields: {socials: 1}}).fetch()
  var identifiers = getTwitterIdentifiers(contacts)
  var totalIdentifiers = identifiers.id.length + identifiers.screenName.length

  if (!totalIdentifiers) {
    return scheduleProcessContactUpdateQueue()
  }

  TwitterClient.lookupUsers(identifiers, (err, users) => {
    if (err) {
      scheduleProcessContactUpdateQueue()
      return console.error('Failed to update contacts', identifiers, err)
    }

    users.forEach(user => {
      var identifier = {id: user.id, screenName: user.screen_name}
      var contact = findContactByTwitterIdentifier(identifier, contacts)
      if (contact) updateContact(contact, user)
    })

    scheduleProcessContactUpdateQueue()
  })
}

// Turn contacts into {id: [1, 2, 3], screenName: ['five', 'six']}
// User ID takes preference over screen name
function getTwitterIdentifiers (contacts) {
  return contacts.reduce((identifiers, contact) => {
    var social = findTwitterSocial(contact)
    if (!social) return identifiers

    if (social.twitterId) {
      identifiers.id.push(social.twitterId)
    } else if (social.value) {
      identifiers.screenName.push(social.value)
    }

    return identifiers
  }, {id: [], screenName: []})
}

function findTwitterSocial (contact) {
  return (contact.socials || []).find(s => s.label === 'Twitter')
}

// Find contact by twitter user ID or screen name {id: 1, screenName: 'one'}
// User ID takes preference over screen name
function findContactByTwitterIdentifier (identifier, contacts) {
  var id = identifier.id
  var screenName = identifier.screenName.toLowerCase()

  return contacts.find(contact => {
    var social = findTwitterSocial(contact)
    return social && (social.twitterId === id || social.value.toLowerCase() === screenName)
  })
}

function updateContact (contact, user) {
  var data = {}

  if (contact.avatar !== user.profile_image_url_https) {
    data.avatar = user.profile_image_url_https
  }

  var social = findTwitterSocial(contact)

  if (!social.twitterId || user.screen_name !== social.value) {
    social.twitterId = user.id_str
    social.value = user.screen_name
    data.socials = contact.socials
  }

  if (Object.keys(data).length) {
    Contacts.update({_id: contact._id}, {$set: data})
  }
}

ContactsTask.periodicallyUpdate = (period) => {
  check(period, Match.Optional(Number))

  return Meteor.setInterval(() => {
    var ids = Contacts.find({'socials.label': 'Twitter'}, {fields: {_id: 1}}).fetch().map(c => c._id)
    ContactsTask.queueUpdate(ids)
  }, period || 1000 * 60 * 60 * 24)
}

ContactsTask.queueUpdate = (ids) => {
  ids = Array.isArray(ids) ? ids : [ids]
  ids = ids.filter(id => contactUpdateQueue.indexOf(id) === -1)
  contactUpdateQueue = contactUpdateQueue.concat(ids)
}

export default ContactsTask
