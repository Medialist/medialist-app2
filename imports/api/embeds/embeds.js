import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { UserRefSchema, CreatedAtSchema } from '/imports/lib/schema'

export const EmbedSchema = new SimpleSchema([
  CreatedAtSchema, {
    _id: {
      type: String,
      regEx: SimpleSchema.RegEx.Id,
      optional: true
    },
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

export const EmbedRefSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
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
  }
})

const Embeds = new Mongo.Collection('embeds')
Embeds.attachSchema(EmbedSchema)
Embeds.allow(nothing)

export default Embeds

if (Meteor.isServer) {
  Embeds._ensureIndex({ url: 1 })
}

Embeds.toRef = (embed) => {
  if (!embed) {
    return embed
  }

  const {_id, url, headline, image, datePublished, outlet} = embed

  const ref = {
    _id,
    url,
    outlet,
    headline,
    image,
    datePublished
  }

  return ref
}

Embeds.findOneEmbedForUrl = (url) => (
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
  })
)

Embeds.findOneEmbedRefForUrl = (url) => {
  if (!url) {
    return null
  }

  return Embeds.toRef(Embeds.findOneEmbedForUrl(url))
}
