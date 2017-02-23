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
import { batchFavouriteCampaigns } from '/imports/api/campaigns/methods'
import { batchAddToMasterLists } from '/imports/api/master-lists/methods'
import AddTags from '../tags/add-tags'
import AbbreviatedAvatarList from '../lists/abbreviated-avatar-list.jsx'
import AddToMasterList from '../master-lists/add-to-master-list.jsx'

const CampaignsPage = React.createClass({
  propTypes: {
    campaigns: PropTypes.arrayOf(PropTypes.object),
    campaignCount: PropTypes.number,
    selectedMasterListSlug: PropTypes.string,
    loading: PropTypes.bool,
    searching: PropTypes.bool,
    sort: PropTypes.object,
    term: PropTypes.string,
    setQuery: PropTypes.func,
    snackbar: PropTypes.object
  },

  getInitialState () {
    return {
      selections: [],
      editCampaignOpen: false,
      addTagsOpen: false,
      addToMasterListsOpen: false
    }
  },

  componentDidMount () {
    const { location: { pathname, query }, router } = this.props
    if (query && query.editCampaignOpen) {
      this.setState({ editCampaignOpen: true })
      router.replace(pathname)
    }
  },

  onMasterListChange (selectedMasterListSlug) {
    this.props.setQuery({ selectedMasterListSlug })
  },

  onSortChange (sort) {
    this.props.setQuery({ sort })
  },

  onTermChange (term) {
    this.props.setQuery({ term })
  },

  onSelectionsChange (selections) {
    this.setState({ selections })
  },

  onDeselectAllClick () {
    this.setState({ selections: [] })
  },

  toggleEditCampaign () {
    this.setState((s) => ({
      editCampaignOpen: !s.editCampaignOpen
    }))
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

  onAddAllToMasterLists (masterLists) {
    const { snackbar } = this.props
    const { selections } = this.state
    const slugs = selections.map((s) => s.slug)
    const masterListIds = masterLists.map((m) => m._id)
    batchAddToMasterLists.call({type: 'Campaigns', slugs, masterListIds}, (err, res) => {
      if (err) {
        console.log(err)
        return snackbar.show('Sorry, that didn\'t work')
      }
      snackbar.show(`Added ${slugs.length} ${slugs.length === 1 ? 'campaign' : 'campaigns'} to ${masterLists.length} ${masterLists.length === 1 ? 'Master List' : 'Master Lists'}`)
    })
  },

  render () {
    const { campaignCount, campaigns, selectedMasterListSlug, loading, total, sort, term, snackbar } = this.props
    const { onSortChange, onSelectionsChange, onMasterListChange, onViewSelection, onFavouriteAll } = this
    const { selections, editCampaignOpen } = this.state

    if (!loading && campaignCount === 0) {
      return (<div>
        <CampaignListEmpty onAddCampaign={this.toggleEditCampaign} />
        <EditCampaignContainer onDismiss={this.toggleEditCampaign} open={editCampaignOpen} />
      </div>)
    }

    return (
      <div>
        <div style={{height: 58}} className='flex items-center justify-end bg-white width-100 shadow-inset-2'>
          <div className='flex-auto border-right border-gray80'>
            <MasterListsSelectorContainer
              type='Campaigns'
              userId={this.props.userId}
              allCount={campaignCount}
              selectedMasterListSlug={selectedMasterListSlug}
              onChange={onMasterListChange} />
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
            onSectorClick={() => this.setState({addToMasterListsOpen: true})}
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
          <AddToMasterList
            type='Campaigns'
            open={this.state.addToMasterListsOpen}
            onDismiss={() => this.setState({addToMasterListsOpen: false})}
            onSave={this.onAddAllToMasterLists}
            title='Add Campaigns to a Master List'>
            <AbbreviatedAvatarList items={selections} maxTooltip={12} shape='square' />
          </AddToMasterList>
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
  const { selectedMasterListSlug, userId } = props
  const lists = MasterLists.find({type: 'Campaigns'}).map(({slug, name, items}) => ({
    slug, name, count: items.length
  }))
  const items = [
    { slug: 'all', name: 'All', count: props.allCount },
    { slug: 'my', name: 'My Campaigns', count: Meteor.user().myCampaigns.length }
  ].concat(lists)
  const selectedSlug = userId ? 'my' : selectedMasterListSlug
  return { ...props, items, selectedSlug }
}, MasterListsSelector)

const SearchableCampaignsPage = createSearchContainer(CampaignsPage)

const CampaignsPageContainer = withSnackbar(withRouter(React.createClass({

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
    const query = Object.assign({}, location.query, newQuery)
    if (query.q === '') delete query.q
    if (query.list === 'all' || newQuery.my) delete query.list
    if (newQuery.list) delete query.my
    const qs = querystring.stringify(query)
    if (!qs) return router.replace('/campaigns')
    router.replace(`/campaigns?${qs}`)
  },

  parseQuery ({query}) {
    const sort = query.sort ? JSON.parse(query.sort) : { updatedAt: -1 }
    const term = query.q || ''
    const { list, my } = query
    return { sort, term, selectedMasterListSlug: list, userId: my }
  },

  render () {
    const { location } = this.props
    return (
      <SearchableCampaignsPage
        {...this.props}
        {...this.data}
        {...this.parseQuery(location)}
        setQuery={this.setQuery} />
    )
  }

})))

export default CampaignsPageContainer
