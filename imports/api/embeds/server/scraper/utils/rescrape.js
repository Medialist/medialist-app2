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

export const rescrape = (embed) => {
  const meta = fetchMetadata(embed)
  if (!meta) return
  const urls = [meta.canonicalUrl, meta.url, embed.url].filter(x => !!x)
  meta.url = urls[0]
  meta.urls = Array.from(new Set(urls.concat(embed.urls)))
  return meta
}

export const rescrapeAll = (embeds) => {
  Embeds.find({}).forEach(embed => {
    const meta = rescrape(embed)
    Embeds.update({
      _id: embed._id
    }, {
      $set: dot.dot(meta)
    })
  })
}
