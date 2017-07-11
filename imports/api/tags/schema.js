import SimpleSchema from 'simpl-schema'
import { IdSchema, CreatedAtSchema } from '/imports/lib/schema'

export const TagSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  slug: {
    type: String,
    min: 1
  },
  contactsCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  },
  campaignsCount: {
    type: Number,
    min: 0,
    defaultValue: 0
  }
})
TagSchema.extend(IdSchema)
TagSchema.extend(CreatedAtSchema)

export const TagRefSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  slug: {
    type: String,
    min: 1
  },
  count: {
    type: Number,
    min: 0
  }
})
TagRefSchema.extend(IdSchema)
