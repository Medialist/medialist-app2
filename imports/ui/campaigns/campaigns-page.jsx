import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { DataDam } from 'react-data-dam'
import MasterLists from '/imports/api/master-lists/master-lists'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignSearch from '/imports/ui/campaigns/campaign-search'
import MasterListsSelector from '/imports/ui/campaigns/masterlists-selector'
import CampaignsActionsToast from '/imports/ui/campaigns/campaigns-actions-toast'
import { CreateCampaignModal } from '/imports/ui/campaigns/edit-campaign'
import CampaignListEmpty from '/imports/ui/campaigns/campaign-list-empty'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { batchAddTagsToCampaigns } from '/imports/api/tags/methods'
import { batchFavouriteCampaigns, removeCampaign } from '/imports/api/campaigns/methods'
import { batchAddToCampaignLists } from '/imports/api/master-lists/methods'
import AddTagsModal from '/imports/ui/tags/add-tags-modal'
import AbbreviatedAvatarList from '/imports/ui/lists/abbreviated-avatar-list'
import AddToMasterListModal from '/imports/ui/master-lists/add-to-master-list-modal'
import campaignsSearchQueryContainer from '/imports/ui/campaigns/campaign-search-query-container'
import CampaignLink from '/imports/ui/campaigns/campaign-link'
import CampaignListLink from '/imports/ui/master-lists/campaign-list-link'
import TagLink from '/imports/ui/campaigns/tag-link'
import { addRecentCampaignList } from '/imports/api/users/methods'
import { CampaignSearchSchema } from '/imports/api/campaigns/schema'
import ShowUpdatesButton from '/imports/ui/lists/show-updates-button'
import { updatedByUserAutoRelease } from '/imports/ui/lists/data-dam'

class CampaignsPage extends React.Component {
  static propTypes = {
    campaigns: PropTypes.arrayOf(PropTypes.object),
    campaignsCount: PropTypes.number,
    allCampaignsCount: PropTypes.number,
    masterListSlug: PropTypes.string,
    tagSlugs: PropTypes.arrayOf(PropTypes.string),
    selectedTags: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
    searching: PropTypes.bool,
    sort: PropTypes.object,
    term: PropTypes.string,
    setQuery: PropTypes.func,
    snackbar: PropTypes.object.isRequired
  }

  state = {
    selections: [],
    selectionMode: 'include',
    createCampaignModal: false,
    addTagsToCampaignsModal: false,
    addToCampaignListsModal: false
  }

  componentDidMount () {
    const { location: { pathname, query }, router } = this.props
    if (query && query.createCampaign) {
      this.setState({
        createCampaignModal: true
      })
      router.replace(pathname)
    }
  }

  onMasterListChange = (masterListSlug) => {
    // Only if not pseudo lists
    if (!['all', 'my'].includes(masterListSlug)) {
      addRecentCampaignList.call({ slug: masterListSlug })
    }
    this.props.setQuery({ masterListSlug })
    this.clearSelection()
  }

  onSelectionsChange = (selections) => {
    this.setState({ selections })
  }

  clearSelectionAndHideModals = () => {
    this.hideModals()
    this.clearSelection()
  }

  clearSelection = () => {
    this.setState({
      selections: [],
      selectionMode: 'include'
    })
  }

  showModal = (modal) => {
    this.hideModals()
    this.setState((s) => ({
      [modal]: true
    }))
  }

  hideModals = () => {
    this.setState({
      createCampaignModal: false,
      addTagsToCampaignsModal: false,
      addToCampaignListsModal: false
    })
  }

  onViewSelection = () => {
    this.props.router.push({
      pathname: '/contacts',
      query: {
        campaign: this.state.selections.map((s) => s.slug).join(',')
      }
    })
  }

  onTagAll = (tags) => {
    const opts = this.getSearchOrSlugs()
    opts.names = tags.map((t) => t.name)
    batchAddTagsToCampaigns.call(opts, (error, res) => {
      if (error) {
        console.log(error)
        return this.props.snackbar.error('campaigns-batch-tag-error')
      }
      const {snackbar} = this.props
      const {slugCount, tagCount} = res
      const name = slugCount > 1 ? `${slugCount} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />
      const tag = tagCount > 1 ? `${tagCount} tags` : <TagLink tag={opts.names[0]} type='campaign' linkClassName='semibold white underline' />
      snackbar.show(<span>Added {tag} to {name}</span>, 'campaigns-batch-tag-success')
    })
  }

  onFavouriteAll = () => {
    const opts = this.getSearchOrSlugs()
    batchFavouriteCampaigns.call(opts, (error, res) => {
      if (error) {
        console.log(error)
        return this.props.snackbar.error('campaigns-batch-favourite-error')
      }
      const {slugCount} = res
      const {snackbar} = this.props
      const name = slugCount > 1 ? `${slugCount} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />
      snackbar.show(<span>Favourited {name}</span>, 'campaigns-batch-favourite-success')
    })
  }

  onAddAllToMasterLists = (masterLists) => {
    const opts = this.getSearchOrSlugs()
    opts.masterListIds = masterLists.map((m) => m._id)
    batchAddToCampaignLists.call(opts, (error, res) => {
      if (error) {
        console.log(error)
        return this.props.snackbar.error('campaigns-batch-add-to-campaign-list-failure')
      }
      const {snackbar} = this.props
      const {slugCount} = res
      const name = slugCount > 1 ? `${slugCount} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />
      const list = masterLists.length > 1 ? `${masterLists.length} Campaign Lists` : <CampaignListLink campaignList={masterLists[0]} linkClassName='semibold white underline' />
      snackbar.show(<span>Added {name} to {list}</span>, 'campaigns-batch-add-to-campaign-list-success')
    })
  }

  onDelete = () => {
    const opts = this.getSearchOrSlugs()
    removeCampaign.call(opts, (error, res) => {
      if (error) {
        console.log(error)
        this.props.snackbar.error('batch-delete-campaigns-failure')
      } else {
        const {snackbar} = this.props
        const {slugCount} = res
        const name = slugCount > 1 ? `${slugCount} Campaigns` : this.state.selections[0].name
        snackbar.show(`Deleted ${name}`, 'batch-delete-campaigns-success')
        this.clearSelectionAndHideModals()
      }
    })
  }

  onTagRemove = (tag) => {
    const { setQuery, tagSlugs } = this.props
    setQuery({
      tagSlugs: tagSlugs.filter((str) => str !== tag.slug)
    })
  }

  onSelectionModeChange = (selectionMode) => {
    this.setState({selectionMode})
  }

  getSearchOrSlugs = () => {
    const {selectionMode} = this.state
    if (selectionMode === 'all') {
      const campaignSearch = this.extractCampaignSearch(this.props)
      return { campaignSearch }
    } else {
      const campaignSlugs = this.state.selections.map((s) => s.slug)
      return { campaignSlugs }
    }
  }

  extractCampaignSearch (props) {
    return CampaignSearchSchema.clean({...props})
  }

  render () {
    const {
      allCampaignsCount,
      campaignsCount,
      campaigns,
      loading,
      sort,
      term,
      selectedTags,
      masterListSlug,
      userId,
      onTermChange,
      onSortChange,
      searching
    } = this.props
    const { onSelectionsChange, onSelectionModeChange, onTagRemove } = this
    const { selections, selectionMode, createCampaignModal } = this.state

    if (!loading && allCampaignsCount === 0) {
      return (
        <div>
          <CampaignListEmpty onAddCampaign={() => this.showModal('createCampaignModal')} />
          <CreateCampaignModal onDismiss={this.hideModals} open={createCampaignModal} />
        </div>
      )
    }

    const selectionsLength = selectionMode === 'all' ? campaignsCount : selections.length

    return (
      <DataDam data={campaigns} flowing={loading} autoRelease={updatedByUserAutoRelease}>
        {(campaigns, diff, release) => (
          <div style={{paddingBottom: 100}}>
            <div style={{height: 58}} className='flex items-center justify-end bg-white width-100 shadow-inset-2 mb8'>
              <div className='flex-auto border-right border-gray80'>
                <MasterListsSelectorContainer
                  type='Campaigns'
                  userId={userId}
                  allCount={allCampaignsCount}
                  selectedMasterListSlug={masterListSlug}
                  onChange={this.onMasterListChange} />
              </div>
              <div className='flex-none bg-white center px4'>
                <button className='btn bg-completed white mx4' onClick={() => this.showModal('createCampaignModal')} data-id='create-campaign-button'>New Campaign</button>
              </div>
            </div>
            <CreateCampaignModal
              onDismiss={() => this.hideModals()}
              open={this.state.createCampaignModal} />
            <CampaignSearch {...{
              onTermChange,
              selectedTags,
              onTagRemove,
              term,
              sort,
              campaigns,
              campaignsCount,
              selections,
              selectionMode,
              onSortChange,
              onSelectionsChange,
              onSelectionModeChange,
              loading,
              searching
            }} />
            <CampaignsActionsToast
              campaigns={selections}
              campaignsCount={selectionsLength}
              onViewClick={this.onViewSelection}
              onSectorClick={() => this.showModal('addToCampaignListsModal')}
              onFavouriteClick={this.onFavouriteAll}
              onTagClick={() => this.showModal('addTagsToCampaignsModal')}
              onDeselectAllClick={this.clearSelection} />
            <AddTagsModal
              title='Tag these Campaigns'
              type='Campaigns'
              open={this.state.addTagsToCampaignsModal}
              onDismiss={this.hideModals}
              onUpdateTags={this.onTagAll}>
              <AbbreviatedAvatarList items={selections} shape='square' total={selectionsLength} />
            </AddTagsModal>
            <AddToMasterListModal
              type='Campaigns'
              title='Add these campaigns to a list'
              items={this.state.selections}
              open={this.state.addToCampaignListsModal}
              onDismiss={this.hideModals}
              onSave={this.onAddAllToMasterLists}>
              <AbbreviatedAvatarList
                items={this.state.selections}
                maxTooltip={12} shape='square' total={selectionsLength} />
            </AddToMasterListModal>
            <ShowUpdatesButton data={campaigns} diff={diff} onClick={release} />
          </div>
        )}
      </DataDam>
    )
  }
}

const MasterListsSelectorContainer = createContainer((props) => {
  const { selectedMasterListSlug, userId } = props

  const user = Meteor.user()

  const lists = MasterLists
    .find({
      type: 'Campaigns'
    }, {
      sort: { name: 1 }
    })
    .map(({slug, name, items}) => ({
      slug, name, count: items.length
    }))

  const items = [{
    slug: 'all',
    name: 'All',
    count: props.allCount
  }, {
    slug: 'my',
    name: 'My Campaigns',
    count: user.myCampaigns.length
  }]
    .concat(lists)

  const selectedSlug = userId ? 'my' : selectedMasterListSlug

  return { ...props, items, selectedSlug }
}, MasterListsSelector)

export default compose(
  campaignsSearchQueryContainer,
  withSnackbar,
  withRouter,
)(CampaignsPage)
