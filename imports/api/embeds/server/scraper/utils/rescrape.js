import { Meteor } from 'meteor/meteor'
import dot from 'dot-object'
import scraper from '/imports/api/embeds/server/scraper'
import Embeds from '/imports/api/embeds/embeds'

const fetchMetadata = ({_id, url}) => {
  let meta = null
  try {
    meta = Meteor.wrapAsync(scraper)(url, {
      timeout: Meteor.settings.embeds ? Meteor.settings.embeds.timeout : 10000,
      headers: {
        'User-Agent': Meteor.settings.embeds ? Meteor.settings.embeds.userAgent : undefined
      }
    })
  } catch (err) {
    console.log('Failed to update embed', _id, url)
  }
  return meta
}

export const rescrape = (oldEmbed) => {
  const embed = fetchMetadata(oldEmbed)
  if (!embed) return
  embed.updatedAt = new Date()
  return embed
}

export const rescrapeAll = (embeds) => {
  Embeds.find({}).forEach(embed => {
    const meta = rescrape(embed)
    if (!meta) return
    Embeds.update({
      _id: embed._id
    }, {
      $set: dot.dot(meta)
    })
  })
}
