import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { IdSchema, AuditSchema } from '/imports/lib/schema'

export const TypeSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Contacts', 'Campaigns']
  }
})

export const MasterListSchema = new SimpleSchema([
  IdSchema,
  AuditSchema,
  TypeSchema, {
    name: {
      type: String,
      min: 1
    },
    slug: {
      type: String,
      min: 1
    },
    items: {
      type: [String],
      regEx: SimpleSchema.RegEx.Id
    },
    order: {
      type: Number
    }
  }
])

export const MasterListRefSchema = new SimpleSchema([
  IdSchema, {
    name: {
      type: String,
      min: 1
    },
    slug: {
      type: String,
      min: 1
    }
  }
])
