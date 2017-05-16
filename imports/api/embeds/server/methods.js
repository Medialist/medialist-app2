import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { findOneUserRef } from '/imports/api/users/users'
import Embeds from '/imports/api/embeds/embeds'
import scraper from '/imports/api/embeds/server/scraper'

export const createEmbed = new ValidatedMethod({
  name: 'createEmbed',

  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.Url }
  }).validator(),

  run ({ url }) {
    if (!this.userId) {
      throw new Meteor.Error('You must be logged in')
    }

    const existingDoc = Embeds.findOneEmbed(url)

    if (existingDoc) {
      return Embeds.toRef(existingDoc)
    }

    try {
      const doc = scraper(url)

      // use the canonical url to see if we've actually seen this link before
      const otherExistingDoc = Embeds.findOneEmbed(doc.canonicalUrl)

      if (otherExistingDoc) {
        otherExistingDoc.urls = Array.isArray(otherExistingDoc.urls) ? otherExistingDoc.urls : []
        otherExistingDoc.urls.push(url)

        Embeds.update({
          _id: otherExistingDoc._id
        }, {
          $set: {
            urls: otherExistingDoc.urls
          }
        })

        return Embeds.toRef(otherExistingDoc)
      }

      // deduped array with no nulls or empty strings
      const urls = Array.from(new Set([
        url, doc.url, doc.canonicalUrl
      ])).filter(url => !!url)

      const embed = {
        outlet: doc.outlet,
        headline: doc.headline,
        url: doc.canonicalUrl,
        image: doc.image,
        datePublished: doc.datePublished,
        urls: urls,
        scrapedBy: doc.agent,
        createdBy: findOneUserRef(this.userId),
        createdAt: new Date()
      }

      embed._id = Embeds.insert(embed)

      return Embeds.toRef(embed)
    } catch (error) {
      console.error(error)

      throw new Meteor.Error('createEmbed.badUrl', `Could not extract embed data from ${url}`)
    }
  }
})
