import SimpleSchema from 'simpl-schema'
import { IdSchema, AuditSchema, CreatedAtSchema } from '/imports/lib/schema'

export const TypeSchema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['Contacts', 'Campaigns']
  }
})

export const MasterListSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  slug: {
    type: String,
    min: 1
  },
  items: {
    type: Array,
    regEx: SimpleSchema.RegEx.Id
  },
  order: {
    type: Number
  }
})
MasterListSchema.extend(IdSchema)
MasterListSchema.extend(AuditSchema)
MasterListSchema.extend(CreatedAtSchema)
MasterListSchema.extend(TypeSchema)

export const MasterListRefSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  slug: {
    type: String,
    min: 1
  }
})
MasterListRefSchema.extend(IdSchema)
