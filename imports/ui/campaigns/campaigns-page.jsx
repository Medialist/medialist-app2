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
import withSnackbar from '../snackbar/with-snackbar'
import createSearchContainer from './campaign-search-container'
import { batchAddTags } from '/imports/api/tags/methods'
import AddTags from '../tags/add-tags'
import AbbreviatedAvatarList from '../lists/abbreviated-avatar-list.jsx'
import { batchFavouriteCampaigns } from '/imports/api/medialists/methods'

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
      editCampaignOpen: false,
      addTagsOpen: false
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

  onTagAll (tags) {
    const { snackbar } = this.props
    const { selections } = this.state
    const slugs = selections.map((s) => s.slug)
    const names = tags.map((t) => t.name)
    batchAddTags.call({type: 'Campaigns', slugs, names}, (err, res) => {
      if (err) {
        console.log(err)
        snackbar.show('Sorry, that didn\'t work')
      }
      snackbar.show(`Add ${names.length} ${names.length === 1 ? 'tag' : 'tags'} to ${slugs.length} ${slugs.length === 1 ? 'campaign' : 'campaigns'}`)
    })
  },

  onFavouriteAll () {
    const { snackbar } = this.props
    const { selections } = this.state
    const campaignSlugs = selections.map((c) => c.slug)
    batchFavouriteCampaigns.call({campaignSlugs}, (err, res) => {
      if (err) {
        console.log(err)
        snackbar.show('Sorry, that didn\'t work.')
      }
      snackbar.show(`Favourited ${campaignSlugs.length} ${campaignSlugs.length === 1 ? 'campaign' : 'campaigns'}`)
    })
  },

  render () {
    const { campaignCount, campaigns, loading, total, sort, term, snackbar } = this.props
    const { onSortChange, onSelectionsChange, onSectorChange, onViewSelection, onFavouriteAll } = this
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
            onFavouriteClick={onFavouriteAll}
            onTagClick={() => this.setState({addTagsOpen: true})}
            onDeleteClick={() => snackbar.show('TODO: delete campaigns')}
            onDeselectAllClick={this.onDeselectAllClick} />
          <AddTags
            type='Campaigns'
            open={this.state.addTagsOpen}
            onDismiss={() => this.setState({addTagsOpen: false})}
            onUpdateTags={this.onTagAll}
            title='Tag these Campaigns'>
            <AbbreviatedAvatarList items={selections} shape='square' />
          </AddTags>
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
  const items = MasterLists.find({type: 'Campaigns'}).fetch()
  return { ...props, items, selected: props.selected || items[0] }
}, MasterListsSelector)

const SearchableCampaignsPage = createSearchContainer(CampaignsPage)

const CampaignsPageContainer = withSnackbar(withRouter(React.createClass({

  parseQuery ({query}) {
    const sort = query.sort ? JSON.parse(query.sort) : { updatedAt: -1 }
    const term = query.q || ''
    return { sort, term }
  },

  setQuery (opts) {
    const { location, router } = this.props
    const newQuery = {}
    if (opts.sort) newQuery.sort = JSON.stringify(opts.sort)
    if (opts.hasOwnProperty('term')) {
      newQuery.q = opts.term
    }
    const query = Object.assign({}, location.query, newQuery)
    if (query.q === '') delete query.q
    const qs = querystring.stringify(query)
    router.replace('/campaigns?' + qs)
  },

  render () {
    const { sort, term } = this.parseQuery(this.props.location)
    return (
      <SearchableCampaignsPage
        {...this.props}
        {...this.data}
        sort={sort}
        term={term}
        setQuery={this.setQuery} />
    )
  }

})))

export default CampaignsPageContainer
