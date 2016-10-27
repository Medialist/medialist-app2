import React from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignsTable from './campaigns-table'
import SearchBox from '../lists/search-box'
import SectorSelector from './sector-selector.jsx'
import CampaignsActionsToast from './campaigns-actions-toast'

const CampaignsPage = React.createClass({
  getInitialState () {
    return { sort: { updatedAt: -1 }, selections: [], term: '', selectedSector: null }
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

  onSectorChange (selectedSector) {
    this.setState({ selectedSector })
  },

  onDeselectAllClick () {
    this.setState({ selections: [] })
  },

  newCampaign () {
    console.log('TODO: Open new campaign modal')
  },

  render () {
    const { onSortChange, onSelectionsChange, onSectorChange } = this
    const { sort, term, selections, selectedSector } = this.state

    return (
      <div>
        <div className='flex items-center justify-end bg-white width-100'>
          <div className='flex-auto border-right border-gray80'>
            <SectorSelectorContainer selected={selectedSector} onSectorChange={onSectorChange} />
          </div>
          <div className='flex-none bg-white center px4'>
            <button className='btn bg-completed white mx4' onClick={this.newCampaign}>New Campaign</button>
          </div>
        </div>
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
            selections={selections}
            onSortChange={onSortChange}
            onSelectionsChange={onSelectionsChange} />
          <CampaignsActionsToast
            campaigns={selections}
            onViewClick={() => console.log('TODO: view selection')}
            onSectorClick={() => console.log('TODO: add/edit sectors')}
            onFavouriteClick={() => console.log('TODO: toggle favourite')}
            onTagClick={() => console.log('TODO: add/edit tags')}
            onDeleteClick={() => console.log('TODO: delete campaign(s)')}
            onDeselectAllClick={this.onDeselectAllClick} />
        </div>
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

const SectorSelectorContainer = createContainer((props) => {
  // TODO: wire in sectors
  const items = [
    { _id: 0, name: 'All', count: 10 },
    { _id: 1, name: 'My campaigns', count: 5 },
    { _id: 2, name: 'Corporate', count: 97 },
    { _id: 3, name: 'Energy', count: 18 },
    { _id: 4, name: 'Consumer', count: 120 },
    { _id: 5, name: 'Healthcare', count: 55 },
    { _id: 6, name: 'Public Affairs', count: 37 },
    { _id: 7, name: 'Technology', count: 201 }

  ]
  return { ...props, items, selected: props.selected || items[0] }
}, SectorSelector)

export default CampaignsPage
