import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { IdSchema, CreatedAtSchema } from '/imports/lib/schema'

export const TagSchema = new SimpleSchema([
  IdSchema,
  CreatedAtSchema, {
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
  }
])

export const TagRefSchema = new SimpleSchema([
  IdSchema, {
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
  }
])
