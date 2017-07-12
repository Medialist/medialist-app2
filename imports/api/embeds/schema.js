import SimpleSchema from 'simpl-schema'
import { IdSchema, CreatedAtSchema } from '/imports/lib/schema'

const ImageSchema = new SimpleSchema({
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  width: {
    type: Number,
    optional: true
  },
  height: {
    type: Number,
    optional: true
  }
})

const ScrapedBySchema = new SimpleSchema({
  name: {
    type: String
  },
  version: {
    type: String
  }
})

export const EmbedSchema = new SimpleSchema({
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url
  },
  urls: {
    type: Array,
    defaultValue: []
  },
  'urls.$': {
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
  image: {
    type: ImageSchema,
    optional: true
  },
  datePublished: {
    type: Date,
    optional: true
  },
  scrapedBy: {
    type: ScrapedBySchema,
    optional: true
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
  image: {
    type: ImageSchema,
    optional: true
  },
  datePublished: {
    type: Date,
    optional: true
  }
})
EmbedRefSchema.extend(IdSchema)
