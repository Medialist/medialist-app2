import React from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Tags from '/imports/api/tags/tags'
import Campaigns from '/imports/api/campaigns/campaigns'
import { CampaignSearchResults, CampaignSearchCount } from './collections'
import { StatusIndex } from '/imports/api/contacts/status'
import { collationSort } from '/imports/lib/collation'

// dir is -1 or 1. Returns a sort functon.
const campaignStatusSort = (contactSlug, dir) => (a, b) => {
  const statusA = a.contacts[contactSlug]
  const statusB = b.contacts[contactSlug]
  return (StatusIndex[statusA] - StatusIndex[statusB]) * dir
}

/**
* CampaignSearchContainer
* Find campaigns by a search term and other criteria.
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
      masterListSlug: PropTypes.string,
      tagSlugs: PropTypes.array,
      userId: PropTypes.string,
      contactSlug: PropTypes.string
    },

    getDefaultProps () {
      return { sort: { updatedAt: -1 } }
    },

    mixins: [ReactMeteorData],

    getMeteorData () {
      const { term, tagSlugs, masterListSlug, userId, contactSlug, sort, limit } = this.props

      const queryOpts = {
        tagSlugs,
        masterListSlug,
        userId,
        contactSlug
      }

      const searching = !!(term && term.length >= minSearchLength)

      if (searching) {
        queryOpts.term = term
      }

      const searchOpts = {
        sort,
        limit,
        ...queryOpts
      }

      const subs = [
        Meteor.subscribe('campaign-search-results', searchOpts)
      ]

      const sortSpec = getCustomSortSpec(sort, contactSlug)

      const campaigns = CampaignSearchResults.find({}, {limit, sort: sortSpec}).fetch()

      const allCampaignsCount = Campaigns.allCampaignsCount()

      let campaignsCount = allCampaignsCount

      if (searching) {
        subs.push(Meteor.subscribe('campaign-search-count-not-reactive', queryOpts))
        const res = CampaignSearchCount.findOne()
        campaignsCount = res ? res.count : allCampaignsCount
      }

      if (userId && userId !== Meteor.userId()) {
        subs.push(Meteor.subscribe('users-by-id', {userIds: [userId]}))
      }

      let selectedTags = []

      if (tagSlugs && tagSlugs.length) {
        subs.push(Meteor.subscribe('tags-by-slug', {tagSlugs}))
        selectedTags = Tags.find({slug: { $in: tagSlugs }}).fetch()
      }

      const loading = !subs.every((sub) => sub.ready())
      return { campaigns, allCampaignsCount, campaignsCount, selectedTags, loading, searching }
    },

    render () {
      return <Component {...this.props} {...this.data} />
    }
  })
}

// returns a sort compator fn or mongo sort specifier
function getCustomSortSpec (sort, contactSlug) {
  if (sort.status && contactSlug) {
    return campaignStatusSort(contactSlug, sort.status)
  }
  // Use collation Sort if is a text field
  const nonTextFields = ['updatedAt']
  const sortKey = Object.keys(sort)[0]
  if (nonTextFields.indexOf(sortKey) === -1) {
    return collationSort(sort)
  }
  return sort
}
