import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import MasterLists from '../../api/master-lists/master-lists'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignSearch from './campaign-search'
import MasterListsSelector from './masterlists-selector'
import CampaignsActionsToast from './campaigns-actions-toast'
import { CreateCampaignModal } from './edit-campaign'
import CampaignListEmpty from './campaign-list-empty'
import withSnackbar from '../snackbar/with-snackbar'
import { batchAddTags } from '/imports/api/tags/methods'
import { batchFavouriteCampaigns } from '/imports/api/campaigns/methods'
import { batchAddToMasterLists } from '/imports/api/master-lists/methods'
import AddTagsModal from '../tags/add-tags-modal'
import AbbreviatedAvatarList from '../lists/abbreviated-avatar-list'
import AddToMasterList from '../master-lists/add-to-master-list'
import campaignsSearchQueryContainer from './campaign-search-query-container'
import CampaignLink from '../campaigns/campaign-link'
import CampaignListLink from '../master-lists/campaign-list-link'
import TagLink from './tag-link'
import DeleteCampaignsModal from './delete-campaign'

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
      createCampaignModal: false,
      addTagsToCampaignsModal: false,
      addToCampaignListsModal: false,
      deleteCampaignsModal: false
    }
  },

  componentDidMount () {
    const { location: { pathname, query }, router } = this.props
    if (query && query.createCampaignModalOpen) {
      this.setState({ createCampaignModalOpen: true })
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
    this.setState({
      selections: []
    })
  },

  toggleModal (modal) {
    this.setState((s) => ({
      [modal]: !s[modal]
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
    const slugs = this.state.selections.map((s) => s.slug)
    const names = tags.map((t) => t.name)

    batchAddTags.call({type: 'Campaigns', slugs, names}, (error) => {
      if (error) {
        console.log(error)
        return this.props.snackbar.error('campaigns-batch-tag-error')
      }

      const name = slugs.length > 1 ? `${slugs.length} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />
      const tag = names.length > 1 ? `${names.length} tags` : <TagLink tag={names[0]} type='campaign' linkClassName='semibold white underline' />

      this.props.snackbar.show(<span>Added {tag} to {name}</span>, 'campaigns-batch-tag-success')
    })
  },

  onFavouriteAll () {
    const campaignSlugs = this.state.selections.map((c) => c.slug)

    batchFavouriteCampaigns.call({campaignSlugs}, (error) => {
      if (error) {
        console.log(error)
        return this.props.snackbar.error('campaigns-batch-favourite-error')
      }

      const name = campaignSlugs.length > 1 ? `${campaignSlugs.length} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />

      this.props.snackbar.show(<span>Favourited {name}</span>, 'campaigns-batch-favourite-success')
    })
  },

  onAddAllToMasterLists (masterLists) {
    const slugs = this.state.selections.map((s) => s.slug)
    const masterListIds = masterLists.map((m) => m._id)

    batchAddToMasterLists.call({type: 'Campaigns', slugs, masterListIds}, (error) => {
      if (error) {
        console.log(error)
        return this.props.snackbar.error('campaigns-batch-add-to-campaign-list-failure')
      }

      const name = slugs.length > 1 ? `${slugs.length} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />
      const list = masterLists.length > 1 ? `${masterLists.length} Campaign Lists` : <CampaignListLink campaignList={masterLists[0]} linkClassName='semibold white underline' />

      this.props.snackbar.show(<span>Added {name} to {list}</span>, 'campaigns-batch-add-to-campaign-list-success')
    })
  },

  onTagRemove (tag) {
    const { setQuery, tagSlugs } = this.props
    setQuery({
      tagSlugs: tagSlugs.filter((str) => str !== tag.slug)
    })
  },

  render () {
    const { campaignCount, campaigns, loading, total, sort, term, selectedTags, onTermChange, onSortChange } = this.props
    const { onSelectionsChange, onTagRemove } = this
    const { selections } = this.state

    if (!loading && campaignCount === 0) {
      return (<div>
        <CampaignListEmpty
          onAddCampaign={() => this.toggleModal('createCampaignModal')}
        />
        <CreateCampaignModal
          onDismiss={() => this.toggleModal('createCampaignModal')}
          open={this.state.createCampaignModal}
        />
      </div>)
    }

    return (
      <div style={{paddingBottom: 100}}>
        <div style={{height: 58}} className='flex items-center justify-end bg-white width-100 shadow-inset-2'>
          <div className='flex-auto border-right border-gray80'>
            <MasterListsSelectorContainer
              type='Campaigns'
              userId={this.props.userId}
              allCount={this.props.campaignCount}
              selectedMasterListSlug={this.props.selectedMasterListSlug}
              onChange={this.onMasterListChange} />
          </div>
          <div className='flex-none bg-white center px4'>
            <button className='btn bg-completed white mx4' onClick={() => this.toggleModal('createCampaignModal')} data-id='create-campaign-button'>New Campaign</button>
          </div>
        </div>
        <CreateCampaignModal
          onDismiss={() => this.toggleModal('createCampaignModal')}
          open={this.state.createCampaignModal} />
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
          onViewClick={this.onViewSelection}
          onSectorClick={() => this.toggleModal('addToCampaignListsModal')}
          onFavouriteClick={this.onFavouriteAll}
          onTagClick={() => this.toggleModal('addTagsToCampaignsModal')}
          onDeleteClick={() => this.toggleModal('deleteCampaignsModal')}
          onDeselectAllClick={this.onDeselectAllClick} />
        <AddTagsModal
          type='Campaigns'
          open={this.state.addTagsToCampaignsModal}
          onDismiss={() => this.toggleModal('addTagsToCampaignsModal')}
          onUpdateTags={this.onTagAll}
          title='Tag these Campaigns'>
          <AbbreviatedAvatarList items={this.state.selections} shape='square' />
        </AddTagsModal>
        <AddToMasterList
          type='Campaigns'
          open={this.state.addToCampaignListsModal}
          onDismiss={() => this.toggleModal('addToCampaignListsModal')}
          onSave={this.onAddAllToMasterLists}
          title='Add to a Campaign List'>
          <AbbreviatedAvatarList
            items={this.state.selections}
            maxTooltip={12} shape='square' />
        </AddToMasterList>
        <DeleteCampaignsModal
          open={this.state.deleteCampaignsModal}
          onDismiss={() => {
            this.onDeselectAllClick()
            this.toggleModal('deleteCampaignsModal')
          }}
          campaigns={this.state.selections}
          title='Add to a Campaign List' />
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
