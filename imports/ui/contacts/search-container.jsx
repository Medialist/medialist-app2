import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Contacts from '../../api/contacts/contacts'

/**
* Wrap your component in me to gain contact searching powers.
*
* You pass the search `term` and the results `sort` props.
*
* The container provides you with these props:
* `contacts` - search results
* `contactsCount` - count of all contacts available
* `loading` - search subscription is loading
* `searching` - true if the term is long enough to trigger a search subscription
*/
export default (Component, opts = {}) => {
  opts.minSearchLength = opts.minSearchLength || 3

  return React.createClass({
    propTypes: {
      term: PropTypes.string.isRequired,
      // http://docs.meteor.com/api/collections.html#sortspecifiers
      sort: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
      campaignSlugs: PropTypes.arrayOf(PropTypes.string)
    },

    getDefaultProps () {
      return { sort: { updatedAt: -1 } }
    },

    mixins: [ReactMeteorData],

    getMeteorData () {
      const { sort, term, campaignSlugs } = this.props
      const subs = [ Meteor.subscribe('contactCount') ]
      const contactsCount = window.Counter.get('contactCount')
      const query = {}
      if (campaignSlugs.length) {
        query.medialists = { $in: campaignSlugs }
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
      console.log({query})
      const contacts = Contacts.find(query, { sort }).fetch()
      const loading = !subs.every((sub) => sub.ready())

      return { contacts, contactsCount, loading, searching }
    },

    render () {
      return <Component {...this.props} {...this.data} />
    }
  })
}
