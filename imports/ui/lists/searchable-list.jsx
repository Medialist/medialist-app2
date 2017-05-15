import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import escapeRegExp from 'lodash.escaperegexp'
import immutable from 'object-path-immutable'

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
      // http://docs.meteor.com/api/collections.html#sortspecifiers
      sort: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
      query: PropTypes.object.isRequired,
      fields: PropTypes.object.isRequired,
      collection: PropTypes.string.isRequired,
      allItems: PropTypes.array
    },

    getDefaultProps () {
      return {
        sort: {
          updatedAt: -1
        },
        term: '',
        collections: []
      }
    },

    getInitialState () {
      return {
        term: null
      }
    },

    mixins: [ReactMeteorData],

    onFieldChange (event) {
      const { name, value } = event.target
      this.setState((s) => immutable.set(s, name, value))
    },

    getMeteorData () {
      const searching = !!(this.state.term && this.state.term.length >= minSearchLength)
      const subscription = Meteor.subscribe(this.props.collection)
      const loading = !subscription.ready()
      const collection = Meteor.connection._stores[this.props.collection]._getCollection()

      let query = {}

      if (this.state.term) {
        query = JSON.parse(
          JSON.stringify(this.props.query)
            .replace(/\$term/g, escapeRegExp(this.state.term))
        )
      }

      const items = collection.find(query, this.props.fields).fetch()

      return {
        items, loading, searching
      }
    },

    render () {
      return <Component {...this.props} {...this.data} onTermChange={event => this.onFieldChange(event)} />
    }
  })
}
