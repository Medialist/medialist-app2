import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { UserRefSchema } from '/imports/lib/schema'

const Embeds = new Mongo.Collection('embeds')

Embeds.allow(nothing)

export default Embeds

if (Meteor.isServer) {
  Embeds._ensureIndex({ url: 1 })
}

Embeds.toRef = ({_id, url, urls, headline, image, datePublished, outlet}) => ({
  _id,
  url,
  urls,
  outlet,
  headline,
  image,
  datePublished
})

Embeds.findOneById = (_id) => (
  Embeds.findOne({ _id }, {
    fields: {
      _id: 1,
      url: 1,
      outlet: 1,
      headline: 1,
      image: 1,
      datePublished: 1,
      urls: 1
    }
  })
)

Embeds.findOneEmbed = (url) => (
  Embeds.findOne({
    $or: [{
      url: url
    }, {
      urls: {
        $in: [
          url
        ]
      }
    }]
  }, {
    fields: {
      _id: 1,
      url: 1,
      outlet: 1,
      headline: 1,
      image: 1,
      datePublished: 1,
      urls: 1
    }
  })
)

Embeds.findOneEmbedRef = (url) => {
  if (!url) {
    return null
  }

  return Embeds.findOne({
    $or: [{
      url: url
    }, {
      urls: {
        $in: [
          url
        ]
      }
    }]
  }, {
    fields: {
      _id: 1,
      outlet: 1,
      url: 1,
      urls: 1,
      headline: 1,
      image: 1,
      datePublished: 1
    }
  })
}

export const BaseEmbedRefSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
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
  },
  urls: {
    type: [String],
    regEx: SimpleSchema.RegEx.Url
  }
})

export const EmbedRefSchema = new SimpleSchema([
  BaseEmbedRefSchema,
  {
    'scrapedBy.name': {
      type: String,
      optional: true
    },
    'scrapedBy.version': {
      type: String,
      optional: true
    },
    createdBy: {
      type: UserRefSchema
    },
    createdAt: {
      type: Date,
      optional: true
    }
  }
])
