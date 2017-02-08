import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import nothing from '/imports/lib/nothing'
import { cleanSlug } from '/imports/lib/slug'

const Tags = new Mongo.Collection('tags')

Tags.allow(nothing)

if (Meteor.isServer) {
  Tags._ensureIndex({slug: 1})
}

/*
 * Find 30 relvant tags, sorted by users favourites and then popularity
 */
Tags.suggest = ({type, userId, searchTerm}) => {
  const countField = `${type.toLowerCase()}Count`
  const sort = [[countField, 'desc']]
  const limit = 30
  if (searchTerm) {
    const stem = cleanSlug(searchTerm)
    const query = { slug: { $regex: stem } }
    return Tags.find(query, { sort, limit })
  } else {
    const query = {}
    const userSort = [[`users.${userId}`, 'desc']]
    return Tags.find(query, { sort: userSort.concat(sort), limit })
  }
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

