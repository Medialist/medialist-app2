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
      const { sort, term, selectedMasterListSlug, userId, campaignSlugs } = this.props
      const subs = [ Meteor.subscribe('contactCount') ]
      const contactsCount = window.Counter.get('contactCount')
      const query = {}

      if (campaignSlugs && campaignSlugs.length) {
        query.medialists = { $in: campaignSlugs }
        subs.push(Meteor.subscribe('contacts', {campaignSlugs}))
      }
      if (selectedMasterListSlug) {
        query['masterLists.slug'] = selectedMasterListSlug
        subs.push(Meteor.subscribe('contacts', {masterListSlug: selectedMasterListSlug}))
      }
      if (userId) {
        subs.push(Meteor.subscribe('contacts', {userId: userId}))
        if (userId !== Meteor.userId()) {
          subs.push(Meteor.subscribe('users-by-id', {userIds: [userId]}))
        }
        const user = Meteor.users.findOne({_id: userId})
        const myContacts = user && user.myContacts || []
        query.slug = { $in: myContacts.map((c) => c.slug) }
      }

      const searching = term.length >= opts.minSearchLength
      if (searching) {
        const filterRegExp = new RegExp(term, 'gi')
        query.$or = [
          { name: filterRegExp },
          { 'outlets.value': filterRegExp },
          { 'outlets.label': filterRegExp }
        ]
        subs.push(
          Meteor.subscribe('contacts', { regex: term.substr(0, opts.minSearchLength) })
        )
      }
      const contacts = Contacts.find(query, { sort }).fetch()
      const loading = !subs.every((sub) => sub.ready())
      return { contacts, contactsCount, loading, searching }
    },

    render () {
      return <Component {...this.props} {...this.data} />
    }
  })
}
