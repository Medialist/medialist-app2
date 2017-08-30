import SimpleSchema from 'simpl-schema'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import { CreatedAtSchema } from '/imports/lib/schema'
import { ContactCreateSchema } from '/imports/api/contacts/schema'

const ResultSchema = new SimpleSchema({
  created: {
    type: Array
  },
  'created.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  updated: {
    type: Array
  },
  'updated.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  failed: {
    type: Array
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

ContactsImport.allow(nothing)

export default ContactsImport
