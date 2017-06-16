import { Mongo } from 'meteor/mongo'
import { Counter } from 'meteor/natestrauser:publish-performant-counts'
import values from 'lodash.values'
import nothing from '/imports/lib/nothing'
import StatusMap from '/imports/api/contacts/status'
import { ContactRefSchema, ContactCreateSchema, ContactSchema } from './schema'

const Contacts = new Mongo.Collection('contacts')

Contacts.allow(nothing)

Contacts.allContactsCount = () => Counter.get('contactCount')

Contacts.toRef = ({_id, slug, name, avatar, outlets}) => ({
  _id,
  slug,
  name,
  avatar,
  outletName: outlets && outlets.length ? outlets[0].label : ''
})

Contacts.findRefs = ({contactSlugs}) => {
  return Contacts.find(
    { slug: { $in: contactSlugs } },
    { fields: { _id: 1, slug: 1, name: 1, avatar: 1, outlets: 1 } }
  ).map(Contacts.toRef)
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
export { ContactRefSchema, ContactCreateSchema, ContactSchema }
