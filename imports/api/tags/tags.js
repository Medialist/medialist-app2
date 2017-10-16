import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import intersection from 'lodash.intersection'
import union from 'lodash.union'
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

// Update Tags collection to deal with 1 contact being merged into another.
Tags.replaceContact = (incoming, outgoing) => {
  const incomingTagSlugs = incoming.tags.map(t => t.slug)
  const outgoingTagSlugs = outgoing.tags.map(t => t.slug)

  // in both, so have been double counted.
  const toDecriment = intersection(incomingTagSlugs, outgoingTagSlugs)

  Tags.update({
    slug: {
      $in: toDecriment
    }
  }, {
    $inc: {
      contactsCount: -1
    }
  }, {
    multi: true
  })

  // Return the new tag refs as a contact might want them
  return Tags.findRefsForContacts({
    tagSlugs: union(incomingTagSlugs, outgoingTagSlugs)
  })
}

export default Tags
