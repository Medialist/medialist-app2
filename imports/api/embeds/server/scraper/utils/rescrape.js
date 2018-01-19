import { Meteor } from 'meteor/meteor'
import dot from 'dot-object'
import scraper from '/imports/api/embeds/server/scraper'
import Embeds from '/imports/api/embeds/embeds'
import Posts from '/imports/api/posts/posts'

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
  embeds.forEach(oldEmbed => {
    const meta = rescrape(oldEmbed)
    if (!meta) return

    Embeds.update({
      _id: oldEmbed._id
    }, {
      $set: dot.dot(meta)
    })

    // Update embed refs on Posts!
    const embed = Embeds.findOne({_id: oldEmbed._id})

    Posts.update({
      'embeds._id': oldEmbed._id
    }, {
      $set: {
        'embeds.$': Embeds.toRef(embed)
      }
    }, {
      multi: true
    })
  })
}
