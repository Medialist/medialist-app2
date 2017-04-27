import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Tags from '/imports/api/tags/tags'
import Campaigns from '/imports/api/campaigns/campaigns'
import { searchCampaigns } from '/imports/api/campaigns/queries'
import { StatusIndex } from '/imports/api/contacts/status'

// dir is -1 or 1. Returns a sort functon.
const campaignStatusSort = (contactSlug, dir) => (a, b) => {
  const statusA = a.contacts[contactSlug]
  const statusB = b.contacts[contactSlug]
  return (StatusIndex[statusA] - StatusIndex[statusB]) * dir
}

/**
* CampaignSearchContainer
* Find campaings by a search term and other criteria.
*
* You can pass in:
* - `term` - The Search term
* - `sort` - a mongo sort sort specifier
* - `limit` - maximum number of docs to fetch.
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
  const minSearchLength = opts.minSearchLength || 3

  return React.createClass({
    propTypes: {
      term: PropTypes.string.isRequired,
      // http://docs.meteor.com/api/collections.html#sortspecifiers
      sort: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
      selectedMasterListSlug: PropTypes.string,
      userId: PropTypes.string,
      contactSlug: PropTypes.string
    },

    getDefaultProps () {
      return { sort: { updatedAt: -1 } }
    },

    mixins: [ReactMeteorData],

    getMeteorData () {
      const { term, tagSlugs, selectedMasterListSlug, userId, contactSlug, sort, limit } = this.props
      const opts = {
        tagSlugs,
        masterListSlug: selectedMasterListSlug,
        userId,
        contactSlug,
        sort,
        limit
      }
      const searching = !!(term && term.length >= minSearchLength)
      if (searching) {
        opts.term = term
      }
      const subs = [
        Meteor.subscribe('campaignCount'),
        Meteor.subscribe('searchCampaigns', opts)
      ]
      if (userId && userId !== Meteor.userId()) {
        subs.push(Meteor.subscribe('users-by-id', {userIds: [userId]}))
      }
      let selectedTags = []
      if (tagSlugs && tagSlugs.length) {
        subs.push(Meteor.subscribe('tags-by-slug', {tagSlugs}))
        selectedTags = Tags.find({slug: { $in: tagSlugs }}).fetch()
      }
      const campaigns = searchCampaigns(opts).fetch()
      if (sort.status && contactSlug) {
        const byStatus = campaignStatusSort(contactSlug, sort.status)
        campaigns.sort(byStatus)
      }
      const campaignCount = Campaigns.allCampaignsCount()
      const loading = !subs.every((sub) => sub.ready())
      return { campaigns, campaignCount, selectedTags, loading, searching }
    },

    render () {
      return <Component {...this.props} {...this.data} />
    }
  })
}
