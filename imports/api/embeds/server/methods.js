import { Meteor } from 'meteor/meteor'
import normalizeUrl from 'normalize-url'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import { findOneUserRef } from '/imports/api/users/users'
import Embeds from '/imports/api/embeds/embeds'
import scraper from '/imports/api/embeds/server/scraper'

export const createEmbed = new ValidatedMethod({
  name: 'createEmbed',

  validate: new SimpleSchema({
    url: {
      type: String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    }
  }).validator(),

  run ({ url }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    if (!url) {
      return
    }

    const normalUrl = normalizeUrl(url, {
      // Some servers simply don't support non www prefix and do not redirect e.g.
      // https://www.manchestereveningnews.co.uk/news/greater-manchester-news/solita-pugs-photo-ban-boycott-14247764
      stripWWW: false
    })

    const existingDoc = Embeds.findOneEmbedForUrl(normalUrl)

    if (existingDoc) {
      return Embeds.toRef(existingDoc)
    }

    try {
      const embed = Meteor.wrapAsync(scraper)(normalUrl, {
        timeout: Meteor.settings.embeds ? Meteor.settings.embeds.timeout : 10000,
        headers: {
          'User-Agent': Meteor.settings.embeds ? Meteor.settings.embeds.userAgent : undefined
        }
      })

      embed.createdBy = findOneUserRef(this.userId)
      embed.createdAt = new Date()

      embed._id = Embeds.insert(embed)

      return Embeds.toRef(embed)
    } catch (error) {
      console.error(error)

      throw new Meteor.Error('createEmbed.badUrl', `Could not extract embed data from ${url}`)
    }
  }
})
