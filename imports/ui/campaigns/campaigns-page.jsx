import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import MasterLists from '../../api/master-lists/master-lists'
import { createContainer } from 'meteor/react-meteor-data'
import querystring from 'querystring'
import CampaignsTable from './campaigns-table'
import SearchBox from '../lists/search-box'
import MasterListsSelector from './masterlists-selector.jsx'
import CampaignsActionsToast from './campaigns-actions-toast'
import EditCampaign from './edit-campaign'
import CampaignListEmpty from './campaign-list-empty'
import withSnackbar from '../snackbar/with-snackbar.jsx'

const CampaignsPage = React.createClass({
  propTypes: {
    campaigns: PropTypes.arrayOf(PropTypes.object),
    campaignCount: PropTypes.number,
    loading: PropTypes.bool,
    searching: PropTypes.bool,
    sort: PropTypes.object,
    term: PropTypes.string,
    setQuery: PropTypes.func,
    snackbar: PropTypes.object
  },

  getInitialState () {
    return {
      sort: { updatedAt: -1 },
      selections: [],
      term: '',
      selectedSector: null,
      editCampaignOpen: false
    }
  },

  componentDidMount () {
    const { location: { pathname, query }, router } = this.props
    if (query && query.editCampaignOpen) {
      this.setState({ editCampaignOpen: true })
      router.replace(pathname)
    }
  },

  toggleEditCampaign () {
    const editCampaignOpen = !this.state.editCampaignOpen
    this.setState({ editCampaignOpen })
  },

  onSortChange (sort) {
    this.props.setQuery({ sort })
  },

  onSelectionsChange (selections) {
    this.setState({ selections })
  },

  onTermChange (term) {
    this.props.setQuery({ term })
  },

  onSectorChange (selectedSector) {
    this.setState({ selectedSector })
  },

  onDeselectAllClick () {
    this.setState({ selections: [] })
  },

  onViewSelection () {
    const { router } = this.props
    const { selections } = this.state
    router.push({
      pathname: '/contacts',
      query: {
        campaign: selections.map((s) => s.slug)
      }
    })
  },

  render () {
    const { campaignCount, campaigns, loading, total, sort, term, snackbar } = this.props
    const { onSortChange, onSelectionsChange, onSectorChange, onViewSelection } = this
    const { selections, selectedSector, editCampaignOpen } = this.state

    if (!loading && campaignCount === 0) {
      return (<div>
        <CampaignListEmpty onAddCampaign={this.toggleEditCampaign} />
        <EditCampaignContainer onDismiss={this.toggleEditCampaign} open={editCampaignOpen} />
      </div>)
    }

    return (
      <div>
        <div className='flex items-center justify-end bg-white width-100 shadow-inset-2'>
          <div className='flex-auto border-right border-gray80'>
            <MasterListsSelectorContainer selected={selectedSector} onSectorChange={onSectorChange} />
          </div>
          <div className='flex-none bg-white center px4'>
            <button className='btn bg-completed white mx4' onClick={this.toggleEditCampaign}>New Campaign</button>
          </div>
        </div>
        <EditCampaignContainer onDismiss={this.toggleEditCampaign} open={editCampaignOpen} />
        <div className='bg-white shadow-2 m4 mt8'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={this.onTermChange} placeholder='Search campaigns...' />
            </div>
            <div className='flex-none pl4 f-xs'>
              <CampaignsTotal total={total} />
            </div>
          </div>
          <CampaignsTable
            term={term}
            sort={sort}
            campaigns={campaigns}
            selections={selections}
            onSortChange={onSortChange}
            onSelectionsChange={onSelectionsChange} />
          <CampaignsActionsToast
            campaigns={selections}
            onViewClick={onViewSelection}
            onSectorClick={() => console.log('TODO: add/edit sectors')}
            onFavouriteClick={() => console.log('TODO: toggle favourite')}
            onTagClick={() => console.log('TODO: add/edit tags')}
            onDeleteClick={() => snackbar.show('TODO: delete campaigns')}
            onDeselectAllClick={this.onDeselectAllClick} />
        </div>
      </div>
    )
  }
})

const CampaignsTotal = ({ total }) => (
  <div>{total} campaign{total === 1 ? '' : 's'} total</div>
)

const EditCampaignContainer = createContainer((props) => {
  Meteor.subscribe('clients')
  return { ...props, clients: window.Clients.find().fetch() }
}, EditCampaign)

const MasterListsSelectorContainer = createContainer((props) => {
  const items = MasterLists.find().fetch()
  return { ...props, items, selected: props.selected || items[0] }
}, MasterListsSelector)

const CampaignsPageContainer = withSnackbar(withRouter(createContainer(({ location, router }) => {
  const { sort, term } = parseQuery(location)
  const subs = [ Meteor.subscribe('campaignCount') ]
  const campaignCount = window.Counter.get('campaignCount')
  const query = {}
  const minSearchLength = 3
  const searching = !!term && term.length >= minSearchLength
  if (searching) {
    const filterRegExp = new RegExp(term, 'gi')
    query.$or = [
      { name: filterRegExp },
      { purpose: filterRegExp },
      { 'client.name': filterRegExp }
    ]
    subs.push(Meteor.subscribe('medialists', {regex: term}))
  }
  const campaigns = window.Medialists.find(query, { sort }).fetch()
  const total = window.Medialists.find().count()
  const loading = !subs.every((sub) => sub.ready())
  const boundSetQuery = setQuery.bind(null, location, router)
  return { campaigns, campaignCount, total, loading, searching, sort, term, setQuery: boundSetQuery }
}, CampaignsPage)))

function parseQuery ({query}) {
  const sort = query.sort ? JSON.parse(query.sort) : { updatedAt: -1 }
  const term = query.q || ''
  return { sort, term }
}

function setQuery (location, router, opts) {
  const newQuery = {}
  if (opts.sort) newQuery.sort = JSON.stringify(opts.sort)
  if (opts.hasOwnProperty('term')) {
    newQuery.q = opts.term
  }
  const query = Object.assign({}, location.query, newQuery)
  if (query.q === '') delete query.q
  const qs = querystring.stringify(query)
  router.replace('/campaigns?' + qs)
}

export default CampaignsPageContainer
