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

Embeds.toRef = ({_id, url, headline, image, entity}) => ({
  _id,
  url,
  headline,
  image: image[0],
  datePublished: entity && entity.datePublished
})

Embeds.findOneEmbedRef = (url) => (
  Embeds.find(
    { $or: [ {canonicalUrl: url}, {url: url} ] },
    { fields: {_id: 1, url: 1, headline: 1, image: 1, entity: 1} }
  ).map(Embeds.toRef)[0]
)

export const EmbedRefSchema = new SimpleSchema({
  _id: { type: String },
  url: { type: String, regEx: SimpleSchema.RegEx.Url },
  headline: { type: String, optional: true },
  'image.url': { type: String, regEx: SimpleSchema.RegEx.Url },
  datePublished: { type: String, optional: true }
})
