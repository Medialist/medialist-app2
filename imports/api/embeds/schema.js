import SimpleSchema from 'simpl-schema'
import { IdSchema, CreatedAtSchema } from '/imports/lib/schema'

export const EmbedSchema = new SimpleSchema({
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  },
  urls: {
    type: Array,
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
})
EmbedSchema.extend(IdSchema)
EmbedSchema.extend(CreatedAtSchema)

export const EmbedRefSchema = new SimpleSchema({
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
})
EmbedRefSchema.extend(IdSchema)
