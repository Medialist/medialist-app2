import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Medialists from '../../api/medialists/medialists'

/**
* CampaignSearchContainer
*
* Pass in a Component to wrap along with sort and search options.
*
* Wrapped Component is given additional props:
* `campaigns` - search results
* `campaignsCount` - count of all contacts available
* `loading` - search subscription is loading
* `searching` - true if the term is long enough to trigger a search subscription
*/
export default (Component, opts = {}) => {
  opts.minSearchLength = opts.minSearchLength || 3

  return React.createClass({
    propTypes: {
      term: PropTypes.string.isRequired,
      // http://docs.meteor.com/api/collections.html#sortspecifiers
      sort: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ])
    },

    getDefaultProps () {
      return { sort: { updatedAt: -1 } }
    },

    mixins: [ReactMeteorData],

    getMeteorData () {
      const { sort, term } = this.props
      const subs = [ Meteor.subscribe('campaignCount') ]
      const campaignCount = window.Counter.get('campaignCount')
      const query = {}
      const searching = term.length >= opts.minSearchLength
      if (searching) {
        const filterRegExp = new RegExp(term, 'gi')
        query.$or = [
          { name: filterRegExp },
          { purpose: filterRegExp },
          { 'client.name': filterRegExp }
        ]
        subs.push(
          Meteor.subscribe('medialists', { regex: term.substr(0, opts.minSearchLength) })
        )
      }
      const campaigns = Medialists.find(query, { sort }).fetch()
      const loading = !subs.every((sub) => sub.ready())
      return { campaigns, campaignCount, loading, searching }
    },

    render () {
      return <Component {...this.props} {...this.data} />
    }
  })
}
