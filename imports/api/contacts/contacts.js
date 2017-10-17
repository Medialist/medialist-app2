import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import values from 'lodash.values'
import everything from '/imports/lib/everything'
import StatusMap from '/imports/api/contacts/status'

const Contacts = new Mongo.Collection('contacts')
Contacts.deny(everything)

if (Meteor.isServer) {
  Contacts._ensureIndex({ slug: 1 })
}

Contacts.allContactsCount = () => Counter.get('contactCount')

Contacts.toRef = (contact) => {
  if (!contact) {
    return null
  }

  const {
    _id,
    slug,
    name,
    avatar,
    outlets,
    updatedAt,
    createdAt
  } = contact

  const ref = {
    _id,
    slug,
    name,
    avatar,
    outlets: outlets && outlets.length ? outlets : [],
    updatedAt: updatedAt || createdAt
  }

  if (!ref.avatar) {
    delete ref.avatar
  }

  return ref
}

Contacts.findRefs = ({contactSlugs}) => {
  return Contacts.find({
    slug: {
      $in: contactSlugs
    }
  }, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      outlets: 1,
      updatedAt: 1,
      createdAt: 1
    }
  }).map(Contacts.toRef)
}

Contacts.findOneRef = (contactSlugOrId) => {
  return Contacts.toRef(Contacts.findOne({
    $or: [{
      _id: contactSlugOrId
    }, {
      slug: contactSlugOrId
    }]
  }, {
    fields: {
      _id: 1,
      slug: 1,
      name: 1,
      avatar: 1,
      outlets: 1,
      updatedAt: 1,
      createdAt: 1
    }
  }))
}

Contacts.status = StatusMap
Contacts.phoneTypes = [
  'Mobile',
  'Landline'
]
Contacts.emailTypes = [
  'Work',
  'Personal',
  'Other'
]
Contacts.socialTypes = [
  'Twitter',
  'LinkedIn',
  'Facebook',
  'YouTube',
  'Pinterest',
  'Instagram'
]
// Get the index of a given status for sorting
// String => Integer
Contacts.statusIndex = [].indexOf.bind(values(Contacts.status))

export default Contacts

// Merge contact info from `b` into `a`
Contacts.mergeInfo = (a, b) => {
  a.emails = addIfDistinct('value', a.emails, b.emails)
  a.phones = addIfDistinct('value', a.phones, b.phones)
  a.outlets = addIfDistinct('label', a.outlets, b.outlets)
  a.socials = addIfDistinct('label', a.socials, b.socials)
  a.addresses = addIfCurrentlyEmpty(a.addresses, b.addresses)
  return a
}

function addIfCurrentlyEmpty (oldList = [], newList = []) {
  if (oldList.length > 0) {
    return oldList
  }

  return oldList.concat(newList)
}

function addIfDistinct (property, oldList = [], newList = []) {
  const newItems = newList.reduce((list, newItem) => {
    var newValue = newItem[property].toLowerCase()
    var exists = oldList.some(oldItem => {
      const oldValue = oldItem[property]
      return oldValue && oldValue.toLowerCase() === newValue
    })
    return exists ? list : list.concat(newItem)
  }, [])
  return oldList.concat(newItems)
}
