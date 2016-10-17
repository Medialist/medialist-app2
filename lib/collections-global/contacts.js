Contacts = new Mongo.Collection('contacts')

Contacts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

Contacts.status = {
  completed: 'Completed',
  hotLead: 'Hot Lead',
  contacted: 'Contacted',
  toContact: 'To Contact',
  notInterested: 'Not Interested'
}
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
Contacts.statusIndex = [].indexOf.bind(_.values(Contacts.status))

Schemas.Contacts = new SimpleSchema({
  'createdBy._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  'createdBy.name': {
    type: String
  },
  'createdBy.avatar': {
    type: String
  },
  createdAt: {
    type: Date
  },
  'updatedBy._id': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  'updatedBy.name': {
    type: String
  },
  'updatedBy.avatar': {
    type: String
  },
  updatedAt: {
    type: Date
  },
  medialists: {
    type: [String]
  },
  name: {
    type: String,
    min: 1
  },
  avatar: {
    type: String,
    optional: true
  },
  socials: {
    type: [Object],
    optional: true
  },
  'socials.$.label': {
    type: String
  },
  'socials.$.value': {
    type: String,
    optional: true
  },
  'socials.$.twitterId': {
    type: String,
    optional: true
  },
  primaryOutlets: {
    type: String
  },
  otherOutlets: {
    type: String,
    optional: true
  },
  sectors: {
    type: String,
    optional: true
  },
  jobTitles: {
    type: String
  },
  languages: {
    type: String,
    optional: true
  },
  address: {
    type: String,
    optional: true
  },
  website: {
    type: String,
    optional: true
  },
  emails: {
    type: [Object],
    optional: true
  },
  'emails.$.label': {
    type: String
  },
  'emails.$.value': {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  phones: {
    type: [Object],
    optional: true
  },
  'phones.$.label': {
    type: String
  },
  'phones.$.value': {
    type: String,
    optional: true
  },
  bio: {
    type: String,
    optional: true
  },
  slug: {
    type: String
  },
  importedData: {
    type: [Object],
    optional: true
  },
  'importedData.$.importedAt': {
    type: Date
  },
  'importedData.$.data': {
    type: Object,
    blackbox: true
  }
})

Schemas.ContactDetails = new SimpleSchema({
  jobTitles: {
    label: 'Title',
    type: String,
    defaultValue: ''
  },
  'primaryOutlets': {
    label: 'Organisation',
    type: String,
    min: 1
  },
  'emails.$.label': {
    type: String,
  },
  'emails.$.value': {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  'phones.$.value': {
    type: String
  },
  'phones.$.label': {
    type: String,
    allowedValues: Contacts.phoneTypes
  },
})

// TODO: needs contact object for context
Contacts.fieldNames = function (name) {
  var key = name.split('.')[0]
   return {
    'name': 'name',
    'jobTitles': 'title',
    'primaryOutlets': 'organisation',
    'socials': 'social',
    'emails': 'email',
    'phones': 'phone number',
    'website': 'website',
    'address': 'address'
  }[key]
}
