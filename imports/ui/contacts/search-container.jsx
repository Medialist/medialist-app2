import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Contacts from '../../api/contacts/contacts'

/**
* Wrap your component in me to gain contact searching powers.
*
* You can pass in:
* - `term` - The Search term
* - `sort` - a mongo sort sort specifier
* - `masterListSlug` - to search a in a specific list
* - `userId` to search in the `myContacts` for a given user
*
* Your component will recieve these additional props:
* - `contacts` - search results
* - `contactsCount` - count of all contacts available
* - `loading` - search subscription is loading
* - `searching` - true if the term is long enough to trigger a search subscription
*/
export default (Component, opts = {}) => {
  opts.minSearchLength = opts.minSearchLength || 3

  return React.createClass({
    propTypes: {
      limit: PropTypes.number,
      term: PropTypes.string.isRequired,
      // http://docs.meteor.com/api/collections.html#sortspecifiers
      sort: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
      campaignSlugs: PropTypes.arrayOf(PropTypes.string),
      masterListSlug: PropTypes.string,
      userId: PropTypes.string
    },

    getDefaultProps () {
      return { sort: { updatedAt: -1 } }
    },

    mixins: [ReactMeteorData],

    getMeteorData () {
      const { term, selectedMasterListSlug, userId, campaignSlugs, sort, limit } = this.props
      console.log('getMeteorData', sort)
      const subs = [ Meteor.subscribe('contactCount') ]
      const contactsCount = Contacts.allContactsCount()
      const opts = {
        term,
        campaignSlugs,
        masterListSlug: selectedMasterListSlug,
        userId,
        sort,
        limit
      }
      subs.push(Meteor.subscribe('contacts-search', opts))
      const contacts = Contacts.search(opts).fetch()
      const loading = !subs.every((sub) => sub.ready())
      return { contacts, contactsCount, loading, searching: term.length > 2 }
    },

    render () {
      return <Component {...this.props} {...this.data} />
    }
  })
}
