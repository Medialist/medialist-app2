import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import Contacts from './contacts'

/**
 * Find contacts that match a search term and other criteria.
 * Returns a Cursor.
 */
export const searchContacts = ({
  term,
  masterListSlug,
  userId,
  campaignSlugs,
  sort,
  limit = 20,
  minSearchLength = 3
}) => {
  check(term, Match.Maybe(String))
  check(campaignSlugs, Match.Maybe(Array))
  check(masterListSlug, Match.Maybe(String))
  check(userId, Match.Maybe(String))
  check(sort, Object)
  check(limit, Number)

  const query = {}
  if (campaignSlugs && campaignSlugs.length) {
    query.campaigns = { $in: campaignSlugs }
  }
  if (masterListSlug) {
    query['masterLists.slug'] = masterListSlug
  }
  if (userId) {
    const user = Meteor.users.findOne({_id: userId})
    const myContacts = user ? user.myContacts : []
    query.slug = { $in: myContacts.map((c) => c.slug) }
  }
  if (term && term.length >= minSearchLength) {
    const termRegExp = new RegExp(term, 'gi')
    query.$or = [
      { name: termRegExp },
      { 'outlets.value': termRegExp },
      { 'outlets.label': termRegExp }
    ]
  }
  return Contacts.find(query, {sort, limit})
}
