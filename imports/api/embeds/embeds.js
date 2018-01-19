import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import everything from '/imports/lib/everything'

const Embeds = new Mongo.Collection('embeds')
Embeds.deny(everything)

export default Embeds

if (Meteor.isServer) {
  Embeds._ensureIndex({ url: 1 })
}

Embeds.toRef = (embed) => {
  if (!embed) {
    return embed
  }

  const {_id, url, headline, icon, image, datePublished, outlet} = embed

  const ref = {
    _id,
    url,
    outlet,
    headline,
    icon,
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
