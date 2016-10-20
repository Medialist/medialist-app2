import React from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignsTable from './campaigns-table'
import SearchBox from '../lists/search-box'

const CampaignsPage = React.createClass({
  getInitialState () {
    return { sort: { updatedAt: -1 }, selections: [], term: '' }
  },

  onSortChange (sort) {
    this.setState({ sort })
  },

  onSelectionsChange (selections) {
    this.setState({ selections })
  },

  onTermChange (term) {
    this.setState({ term })
  },

  render () {
    const { onSortChange, onSelectionsChange } = this
    const { sort, term } = this.state

    return (
      <div className='bg-white shadow-2 m4'>
        <div className='p4 flex items-center'>
          <div className='flex-auto'>
            <SearchBox onTermChange={this.onTermChange} placeholder='Search campaigns...' />
          </div>
          <div className='flex-none pl4 f-xs'>
            <CampaignsTotalContainer />
          </div>
        </div>
        <CampaignsTableContainer
          sort={sort}
          term={term}
          onSortChange={onSortChange}
          onSelectionsChange={onSelectionsChange} />
      </div>
    )
  }
})

const CampaignsTotal = ({ total }) => (
  <div>{total} campaign{total === 1 ? '' : 's'} total</div>
)

const CampaignsTableContainer = createContainer((props) => {
  Meteor.subscribe('medialists')

  const query = {}

  if (props.term) {
    const filterRegExp = new RegExp(props.term, 'gi')
    query.$or = [
      { name: filterRegExp },
      { purpose: filterRegExp },
      { 'client.name': filterRegExp }
    ]
  }

  const campaigns = window.Medialists.find(query, { sort: props.sort }).fetch()
  return { ...props, campaigns }
}, CampaignsTable)

const CampaignsTotalContainer = createContainer((props) => {
  return { ...props, total: window.Medialists.find({}).count() }
}, CampaignsTotal)

export default CampaignsPage
