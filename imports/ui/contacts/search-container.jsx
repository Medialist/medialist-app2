import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Tags from '/imports/api/tags/tags'
import Contacts from '/imports/api/contacts/contacts'
import { searchContacts } from '/imports/api/contacts/queries'

/**
* SearchContainer
* Find contacts by a search term and other criteria.
*
* You can pass in:
* - `term` - The Search term
* - `sort` - A mongo sort sort specifier
* - `limit` - Maximum number of docs to fetch.
* - `campaingSlugs` - Array of campaigns ot search in.
* - `masterListSlug` - To search a in a specific list
* - `userId` to search in the `myContacts` for a given user
*
* Your component will recieve these additional props:
* - `contacts` - search results
* - `contactsCount` - count of all contacts available
* - `loading` - search subscription is loading
* - `searching` - true if the term is long enough to trigger a search subscription
*/
export default (Component, opts = {}) => {
  const minSearchLength = opts.minSearchLength || 3

  return React.createClass({
    propTypes: {
      limit: PropTypes.number,
      term: PropTypes.string.isRequired,
      // http://docs.meteor.com/api/collections.html#sortspecifiers
      sort: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
      campaignSlugs: PropTypes.arrayOf(PropTypes.string),
      selectedMasterListSlug: PropTypes.string,
      userId: PropTypes.string
    },

    getDefaultProps () {
      return { sort: { updatedAt: -1 } }
    },

    mixins: [ReactMeteorData],

    getMeteorData () {
      const { term, tagSlugs, selectedMasterListSlug, userId, campaignSlugs, sort, limit } = this.props
      const opts = {
        tagSlugs,
        campaignSlugs,
        masterListSlug: selectedMasterListSlug,
        userId,
        sort,
        limit
      }
      const searching = !!(term && term.length >= minSearchLength)
      if (searching) {
        opts.term = term
      }
      const subs = [
        Meteor.subscribe('contactCount'),
        Meteor.subscribe('searchContacts', opts)
      ]
      if (userId && userId !== Meteor.userId()) {
        subs.push(Meteor.subscribe('users-by-id', {userIds: [userId]}))
      }
      if (tagSlugs && tagSlugs.length) {
        subs.push(Meteor.subscribe('tags-by-slug', {tagSlugs}))
      }
      const selectedTags = Tags.find({slug: { $in: tagSlugs }}).fetch()
      const contacts = searchContacts(opts).fetch()
      const contactsCount = Contacts.allContactsCount()
      const loading = !subs.every((sub) => sub.ready())
      return { contacts, contactsCount, selectedTags, loading, searching }
    },

    render () {
      return <Component {...this.props} {...this.data} />
    }
  })
}
