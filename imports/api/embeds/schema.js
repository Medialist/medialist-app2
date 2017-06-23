import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { IdSchema, CreatedAtSchema } from '/imports/lib/schema'

export const EmbedSchema = new SimpleSchema([
  IdSchema,
  CreatedAtSchema, {
    url: {
      type: String,
      regEx: SimpleSchema.RegEx.Url
    },
    urls: {
      type: [String],
      regEx: SimpleSchema.RegEx.Url
    },
    headline: {
      type: String,
      optional: true
    },
    outlet: {
      type: String,
      optional: true
    },
    'image.url': {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    },
    'image.width': {
      type: Number,
      optional: true
    },
    'image.height': {
      type: Number,
      optional: true
    },
    datePublished: {
      type: Date,
      optional: true
    },
    'scrapedBy.name': {
      type: String
    },
    'scrapedBy.version': {
      type: String
    }
  }
])

export const EmbedRefSchema = new SimpleSchema([
  IdSchema, {
    url: {
      type: String,
      regEx: SimpleSchema.RegEx.Url
    },
    headline: {
      type: String,
      optional: true
    },
    outlet: {
      type: String,
      optional: true
    },
    'image.url': {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    },
    'image.width': {
      type: Number,
      optional: true
    },
    'image.height': {
      type: Number,
      optional: true
    },
    datePublished: {
      type: Date,
      optional: true
    }
  }
])
