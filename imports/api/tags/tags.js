import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import everything from '/imports/lib/everything'
import { cleanSlug } from '/imports/lib/slug'

const Tags = new Mongo.Collection('tags')
Tags.deny(everything)

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

Tags.toRef = ({_id, name, slug, contactsCount = 0, campaignsCount = 0}) => {
  const ref = {
    _id,
    slug,
    name,
    count: contactsCount + campaignsCount
  }

  return ref
}

Tags.findRefs = ({tagSlugs}) => {
  return Tags.find({
    slug: {
      $in: tagSlugs
    }
  }, {
    fields: {
      _id: 1,
      name: 1,
      slug: 1,
      contactsCount: 1,
      campaignsCount: 1
    }
  }).map(Tags.toRef)
}

Tags.findRefsForCampaigns = ({tagSlugs}) => {
  return Tags.find({
    slug: {
      $in: tagSlugs
    }
  }, {
    fields: {
      _id: 1,
      name: 1,
      slug: 1,
      campaignsCount: 1
    }
  }).map(Tags.toRef)
}

Tags.findRefsForContacts = ({tagSlugs}) => {
  return Tags.find({
    slug: {
      $in: tagSlugs
    }
  }, {
    fields: {
      _id: 1,
      name: 1,
      slug: 1,
      contactsCount: 1
    }
  }).map(Tags.toRef)
}

export default Tags
