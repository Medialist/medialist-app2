import { Meteor } from 'meteor/meteor'
import { Promise } from 'meteor/promise'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { findOneUserRef } from '/imports/api/users/users'
import Embeds from '../embeds'
import scrapeAndExtract from './scraper'
import scrappyPackage from 'scrappy/package.json'

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
      const doc = Promise.await(scrapeAndExtract(url))

      // scrappy follows redirects and updates the original url based on the new
      // location so search again in case we have actually seen this embed before
      const otherExistingDoc = Embeds.findOneEmbed(doc.url)

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

      const image = Array.isArray(doc.image) ? doc.image[0] : doc.image

      // deduped array with no nulls or empty strings
      const urls = Array.from(new Set([
        url, doc.url, doc.canonicalUrl
      ])).filter(url => !!url)

      const embed = {
        headline: doc.headline,
        url: doc.url || doc.canonicalUrl || url,
        image: image ? {
          url: image.url,
          width: image.width || undefined,
          height: image.height || undefined
        } : undefined,
        datePublished: doc.entity ? doc.entity.datePublished : undefined,
        urls: urls,
        scrapedBy: {
          name: 'scrappy',
          version: scrappyPackage.version
        },
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
