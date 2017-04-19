import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import nothing from '/imports/lib/nothing'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'

const Embeds = new Mongo.Collection('embeds')

Embeds.allow(nothing)

export default Embeds

if (Meteor.isServer) {
  Embeds._ensureIndex({ url: 1 })
}

Embeds.toRef = ({_id, url, urls, headline, image, datePublished}) => ({
  _id,
  url,
  urls,
  headline,
  image,
  datePublished
})

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
      headline: 1,
      image: 1,
      datePublished: 1,
      urls: 1
    }
  })
)

Embeds.findOneEmbedRef = (url) => (
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
      urls: 1,
      headline: 1,
      image: 1,
      datePublished: 1
    }
  })
)

export const EmbedRefSchema = new SimpleSchema({
  _id: { type: String },
  url: { type: String, regEx: SimpleSchema.RegEx.Url },
  headline: { type: String, optional: true },
  'image.url': { type: String, regEx: SimpleSchema.RegEx.Url },
  'image.width': { type: Number },
  'image.height': { type: Number },
  datePublished: { type: String, optional: true },
  urls: { type: [String], regEx: SimpleSchema.RegEx.Url },
  'scrapedBy.name': { type: String, optional: true },
  'scrapedBy.version': { type: String, optional: true },
  createdBy: { type: String, optional: true },
  createdAt: { type: Date, optional: true }
})
