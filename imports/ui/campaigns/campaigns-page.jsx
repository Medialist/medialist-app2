import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import MasterLists from '../../api/master-lists/master-lists'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignSearch from './campaign-search'
import MasterListsSelector from './masterlists-selector.jsx'
import CampaignsActionsToast from './campaigns-actions-toast'
import EditCampaign from './edit-campaign'
import CampaignListEmpty from './campaign-list-empty'
import withSnackbar from '../snackbar/with-snackbar'
import { batchAddTags } from '/imports/api/tags/methods'
import { batchFavouriteCampaigns } from '/imports/api/campaigns/methods'
import { batchAddToMasterLists } from '/imports/api/master-lists/methods'
import AddTags from '../tags/add-tags'
import AbbreviatedAvatarList from '../lists/abbreviated-avatar-list.jsx'
import AddToMasterList from '../master-lists/add-to-master-list.jsx'
import campaignsSearchQueryContainer from './campaign-search-query-container'

const CampaignsPage = withSnackbar(withRouter(React.createClass({
  propTypes: {
    campaigns: PropTypes.arrayOf(PropTypes.object),
    campaignCount: PropTypes.number,
    selectedMasterListSlug: PropTypes.string,
    tagSlugs: PropTypes.arrayOf(PropTypes.string),
    selectedTags: PropTypes.arrayOf(PropTypes.object),
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

  onTagRemove (tag) {
    const { setQuery, tagSlugs } = this.props
    setQuery({
      tagSlugs: tagSlugs.filter((str) => str !== tag.slug)
    })
  },

  render () {
    const { campaignCount, campaigns, selectedMasterListSlug, loading, total, sort, term, snackbar, selectedTags, onTermChange, onSortChange } = this.props
    const { onSelectionsChange, onMasterListChange, onViewSelection, onFavouriteAll, onTagRemove } = this
    const { selections, editCampaignOpen } = this.state

    if (!loading && campaignCount === 0) {
      return (<div>
        <CampaignListEmpty onAddCampaign={this.toggleEditCampaign} />
        <EditCampaign onDismiss={this.toggleEditCampaign} open={editCampaignOpen} />
      </div>)
    }

    return (
      <div style={{paddingBottom: 100}}>
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
            <button className='btn bg-completed white mx4' onClick={this.toggleEditCampaign} data-id='create-campaign-button'>New Campaign</button>
          </div>
        </div>
        <EditCampaign onDismiss={this.toggleEditCampaign} open={editCampaignOpen} />
        <CampaignSearch {...{
          onTermChange,
          selectedTags,
          onTagRemove,
          total,
          term,
          sort,
          campaigns,
          selections,
          onSortChange,
          onSelectionsChange,
          loading
        }} />
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
    )
  }
})))

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

export default campaignsSearchQueryContainer(CampaignsPage)
