import { Meteor } from 'meteor/meteor'
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

    const existingDoc = Embeds.findOneEmbedForUrl(url)

    if (existingDoc) {
      return Embeds.toRef(existingDoc)
    }

    try {
      const doc = Meteor.wrapAsync(scraper)(url, {
        timeout: Meteor.settings.embeds ? Meteor.settings.embeds.timeout : 10000,
        headers: {
          'User-Agent': Meteor.settings.embeds ? Meteor.settings.embeds.userAgent : undefined
        }
      })

      if (doc.canonicalUrl) {
        // use the canonical url to see if we've actually seen this link before
        const otherExistingDoc = Embeds.findOneEmbedForUrl(doc.canonicalUrl)

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
      }

      // deduped array with no nulls or empty strings
      let urls = Array.from(new Set([
        url, doc.url, doc.canonicalUrl
      ])).filter(url => !!url)

      // we were redirect to a different page
      if (doc.url && doc.url !== url) {
        url = doc.url
      }

      // we have a canonical url, use that as our main url
      if (doc.canonicalUrl) {
        url = doc.canonicalUrl
      }

      // filter the main url from the alternative urls list
      urls = urls.filter(u => u !== url)

      const embed = {
        outlet: doc.outlet,
        headline: doc.headline,
        url: url,
        icon: doc.icon,
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
