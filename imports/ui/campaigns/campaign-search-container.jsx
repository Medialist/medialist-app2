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
      sort: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
      selectedMasterListSlug: PropTypes.string,
      userId: PropTypes.string
    },

    getDefaultProps () {
      return { sort: { updatedAt: -1 } }
    },

    mixins: [ReactMeteorData],

    getMeteorData () {
      const { sort, term, selectedMasterListSlug, userId } = this.props
      const subs = [ Meteor.subscribe('campaignCount') ]
      const campaignCount = window.Counter.get('campaignCount')
      const query = {}

      if (selectedMasterListSlug) {
        query['masterLists.slug'] = selectedMasterListSlug
        subs.push(Meteor.subscribe('medialists', {masterListSlug: selectedMasterListSlug}))
      }
      if (userId) {
        subs.push(Meteor.subscribe('medialists', {userId: userId}))
        if (userId !== Meteor.userId()) {
          subs.push(Meteor.subscribe('users-by-id', {userIds: [userId]}))
        }
        const user = Meteor.users.findOne({_id: userId})
        const myMedialists = user && user.myMedialists || []
        query.slug = { $in: myMedialists.map((c) => c.slug) }
      }

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
