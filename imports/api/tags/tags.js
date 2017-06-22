import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import nothing from '/imports/lib/nothing'
import { cleanSlug } from '/imports/lib/slug'
import { CreatedAtSchema } from '/imports/lib/schema'

export const TagSchema = new SimpleSchema([
  CreatedAtSchema, {
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
      min: 0,
      defaultValue: 0
    },
    campaignsCount: {
      type: Number,
      min: 0,
      defaultValue: 0
    }
  }
])

export const TagRefSchema = new SimpleSchema({
  name: {
    type: String,
    min: 1
  },
  slug: {
    type: String,
    min: 1
  },
  count: {
    type: Number,
    min: 0
  }
})

const Tags = new Mongo.Collection('tags')
Tags.attachSchema(TagSchema)
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
