import React from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import querystring from 'querystring'
import campaignsSearchContainer from './campaign-search-container'
import NearBottomContainer from '../navigation/near-bottom-container'
import SubscriptionLimitContainer from '../navigation/subscription-limit-container'

const campaignsSearchQueryContainer = (Component) => {
  const SearchComponent = campaignsSearchContainer(Component)
  return withRouter(React.createClass({
    setQuery (opts) {
      const { location, router } = this.props
      const newQuery = {}
      if (opts.sort) newQuery.sort = JSON.stringify(opts.sort)
      if (opts.hasOwnProperty('term')) {
        newQuery.q = opts.term
      }
      if (opts.selectedMasterListSlug) {
        if (opts.selectedMasterListSlug === 'my') {
          newQuery.my = Meteor.userId()
        } else {
          newQuery.list = opts.selectedMasterListSlug
        }
      }
      if (opts.tagSlugs) newQuery.tag = opts.tagSlugs
      const query = Object.assign({}, location.query, newQuery)
      if (query.q === '') delete query.q
      if (query.list === 'all' || newQuery.my) delete query.list
      if (newQuery.list) delete query.my
      const qs = querystring.stringify(query)
      if (!qs) return router.replace(location.pathname)
      router.replace(`${location.pathname}?${qs}`)
    },

    parseQuery ({query}) {
      const sort = query.sort ? JSON.parse(query.sort) : { updatedAt: -1 }
      const term = query.q || ''
      const tagSlugs = query.tag ? [query.tag] : []
      const { list, my } = query
      return { sort, term, selectedMasterListSlug: list, userId: my, tagSlugs }
    },

    render () {
      const { location } = this.props
      return (
        <NearBottomContainer>
          {(nearBottom) => (
            <SubscriptionLimitContainer wantMore={nearBottom}>
              {(limit) => (
                <SearchComponent
                  limit={limit}
                  {...this.props}
                  {...this.data}
                  {...this.parseQuery(location)}
                  setQuery={this.setQuery} />
              )}
            </SubscriptionLimitContainer>
          )}
        </NearBottomContainer>
      )
    }
  }))
}

export default campaignsSearchQueryContainer
