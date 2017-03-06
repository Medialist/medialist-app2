import { Meteor } from 'meteor/meteor'
import { Promise } from 'meteor/promise'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import Embeds from '../embeds'
import { scrapeAndExtract } from 'scrappy'

export const createEmbed = new ValidatedMethod({
  name: 'createEmbed',

  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.Url }
  }).validator(),

  run ({ url }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const existingDoc = Embeds.findOne({url: url})
    if (existingDoc) return existingDoc

    // const doc = scrapeMeta(url)
    const doc = Promise.await(scrapeAndExtract(url))
    Embeds.insert(doc)

    return doc
  }
})
