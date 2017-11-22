import { Meteor } from 'meteor/meteor'
import { check } from 'meteor/check'
import escapeRegExp from 'lodash.escaperegexp'
import Contacts from '/imports/api/contacts/contacts'
import { ContactSearchSchema } from '/imports/api/contacts/schema'
import { checkAllSlugsExist } from '/imports/lib/slug'

export const createContactSearchQuery = (contactSearch) => {
  const {
    excludeSlugs,
    term,
    tagSlugs,
    masterListSlug,
    userId,
    campaignSlugs,
    importId,
    minSearchLength = 0
  } = contactSearch

  const query = {}

  if (excludeSlugs && excludeSlugs.length) {
    query.slug = { $nin: excludeSlugs }
  }

  if (campaignSlugs && campaignSlugs.length) {
    query.campaigns = {
      $in: campaignSlugs
    }
  }

  if (tagSlugs && tagSlugs.length) {
    query['tags.slug'] = { $in: tagSlugs }
  }

  if (masterListSlug) {
    query['masterLists.slug'] = masterListSlug
  }

  if (userId) {
    const user = Meteor.users.findOne({_id: userId})
    const myContacts = user ? user.myContacts : []

    query.slug = {
      $in: myContacts.map((c) => c.slug)
    }
  }

  if (importId) {
    query['imports'] = importId
  }

  if (term && term.length >= minSearchLength) {
    const termRegExp = new RegExp(escapeRegExp(term), 'i')
    query.$or = [{
      name: termRegExp
    }, {
      'outlets.value': termRegExp
    }, {
      'outlets.label': termRegExp
    }, {
      'tags.name': termRegExp
    }, {
      'masterLists.name': termRegExp
    }]
  }

  return query
}

/**
 * Find contacts that match a search term and other criteria.
 * Returns a Cursor.
 */
export const searchContacts = ({
  sort,
  limit = 20,
  ...contactSearch
}) => {
  check(sort, Object)
  check(limit, Number)
  ContactSearchSchema.validate(contactSearch)

  const query = createContactSearchQuery(contactSearch)
  return Contacts.find(query, {sort, limit})
}

/**
 * Helper method to validate an array of slugs or find slugs from a search
 */
export const findOrValidateContactSlugs = ({contactSearch, contactSlugs}) => {
  if (contactSlugs) {
    checkAllSlugsExist(contactSlugs, Contacts)
    return contactSlugs
  } else {
    const query = createContactSearchQuery(contactSearch)
    return Contacts.find(query, {fields: {slug: 1}}).map((doc) => doc.slug)
  }
}
