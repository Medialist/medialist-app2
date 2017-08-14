import { Meteor } from 'meteor/meteor'
import escapeRegExp from 'lodash.escaperegexp'

export default function createCampaignSearchQuery (campaignSearch) {
  const {
    excludeSlugs,
    term,
    tagSlugs,
    masterListSlug,
    userId,
    contactSlug,
    minSearchLength = 0
  } = campaignSearch

  const query = {}

  if (excludeSlugs && excludeSlugs.length) {
    query.slug = { $nin: excludeSlugs }
  }

  if (masterListSlug) {
    query['masterLists.slug'] = masterListSlug
  }

  if (tagSlugs && tagSlugs.length) {
    query['tags.slug'] = {
      $in: tagSlugs
    }
  }

  if (userId) {
    const user = Meteor.users.findOne({_id: userId})
    const myContacts = user ? user.myCampaigns : []

    query.slug = {
      $in: myContacts.map((c) => c.slug)
    }
  }

  if (contactSlug) {
    query.contacts = contactSlug
  }

  if (term && term.length >= minSearchLength) {
    const termRegExp = new RegExp(escapeRegExp(term), 'gi')

    query.$or = [{
      name: termRegExp
    }, {
      'purpose': termRegExp
    }, {
      'client.name': termRegExp
    }, {
      'tags.name': termRegExp
    }, {
      'masterLists.name': termRegExp
    }]
  }

  return query
}
