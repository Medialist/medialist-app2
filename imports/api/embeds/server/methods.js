import { Meteor } from 'meteor/meteor'
import { Promise } from 'meteor/promise'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { findOneUserRef } from '/imports/api/users/users'
import Embeds from '../embeds'
import { scrapeAndExtract } from 'scrappy'

export const createEmbed = new ValidatedMethod({
  name: 'createEmbed',

  validate: new SimpleSchema({
    url: { type: String, regEx: SimpleSchema.RegEx.Url }
  }).validator(),

  run ({ url }) {
    if (!this.userId) throw new Meteor.Error('You must be logged in')
    const existingDoc = Embeds.findOneEmbedRef(url)
    if (existingDoc) return existingDoc
    try {
      const doc = Promise.await(scrapeAndExtract(url))
      doc.scrapedBy = { name: 'scrappy', version: '0.3.0' }
      doc.createdBy = findOneUserRef(this.userId)
      doc.createdAt = new Date()
      const _id = Embeds.insert(doc)
      return Embeds.toRef({_id, ...doc})
    } catch (err) {
      throw new Meteor.Error('createEmbed.badUrl', `Could not exract embed data from ${url}`)
    }
  }
})
