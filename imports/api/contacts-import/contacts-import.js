import SimpleSchema from 'simpl-schema'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import { CreatedAtSchema } from '/imports/lib/schema'
import { ContactCreateSchema } from '/imports/api/contacts/schema'

const ResultSchema = new SimpleSchema({
  created: {
    type: Array,
    regEx: SimpleSchema.RegEx.Id,
    defaultValue: []
  },
  updated: {
    type: Array,
    regEx: SimpleSchema.RegEx.Id,
    defaultValue: []
  },
  failed: {
    type: Array,
    defaultValue: []
  },
  'failed.$': {
    type: ContactCreateSchema
  }
})

export const ContactsImportSchema = new SimpleSchema({
  data: {
    type: Array
  },
  'data.$': {
    type: ContactCreateSchema
  },
  results: {
    type: ResultSchema
  }
})
ContactsImportSchema.extend(CreatedAtSchema)

const ContactsImport = new Mongo.Collection('contactsImport')
ContactsImport.attachSchema(ContactsImportSchema)
ContactsImport.allow(nothing)

export default ContactsImport
