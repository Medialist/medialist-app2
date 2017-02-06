import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import nothing from '/imports/lib/nothing'

const Tags = new Mongo.Collection('tags')

Tags.allow(nothing)

if (Meteor.isServer) {
  Tags._ensureIndex({slug: 1})
}

export default Tags

export const TagSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  slug: {
    type: String,
    min: 1
  },
  contactsCount: {
    type: Number,
    min: 0
  },
  campaignsCount: {
    type: Number,
    min: 0
  },
  users: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id
  },
  updatedAt: {
    type: Date
  }
})
