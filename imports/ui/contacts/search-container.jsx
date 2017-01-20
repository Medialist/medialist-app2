import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Contacts from '../../api/contacts/contacts'

export default (Component, opts) => {
  opts = opts || {}
  opts.minSearchLength = opts.minSearchLength || 3

  return React.createClass({
    propTypes: {
      term: PropTypes.string.isRequired,
      sort: PropTypes.string
    },

    mixins: [ReactMeteorData],

    getMeteorData () {
      const { sort, term } = this.props
      const subs = [ Meteor.subscribe('contactCount') ]
      const contactsCount = window.Counter.get('contactCount')
      const query = {}
      const searching = term.length >= opts.minSearchLength

      if (searching) {
        const filterRegExp = new RegExp(term, 'gi')
        query.$or = [
          { name: filterRegExp },
          { 'outlets.value': filterRegExp },
          { 'outlets.label': filterRegExp }
        ]
        subs.push(Meteor.subscribe('contacts', {regex: term.substring(0, opts.minSearchLength)}))
      }

      const contacts = Contacts.find(query, { sort }).fetch()
      const loading = !subs.every((sub) => sub.ready())

      return { contacts, contactsCount, loading, searching, sort, term }
    },

    render () {
      return <Component {...this.props} {...this.data} />
    }
  })
}
