import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import { CreatedAtSchema } from '/imports/lib/schema'
import { ContactCreateSchema } from '/imports/api/contacts/schema'

const ContactsImport = new Mongo.Collection('contactsImport')

ContactsImport.allow(nothing)

export const ContactsImportSchema = new SimpleSchema([
  CreatedAtSchema,
  {
    filename: {
      type: String
    },
    data: {
      type: [ContactCreateSchema]
    },
    progress: {
      type: Number,
      defaultValue: 0
    },
    'results.created': {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
      defaultValue: []
    },
    'results.updated': {
      type: [String],
      regEx: SimpleSchema.RegEx.Id,
      defaultValue: []
    },
    'results.failed': {
      type: [ContactCreateSchema],
      defaultValue: []
    }
  }
])
