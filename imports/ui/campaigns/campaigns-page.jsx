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
      createCampaignModalOpen: false,
      addTagsOpen: false,
      addToMasterListsOpen: false
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
    this.setState({ selections: [] })
  },

  toggleCreateCampaignModal () {
    this.setState((s) => ({
      createCampaignModalOpen: !s.createCampaignModalOpen
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
    batchAddTags.call({type: 'Campaigns', slugs, names}, (error) => {
      if (error) {
        console.log(error)
        snackbar.error('campaigns-batch-tag-error')
      }

      const name = slugs.length > 1 ? `${slugs.length} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />
      const tag = names.length > 1 ? `${names.length} tags` : <TagLink tag={names[0]} type='campaign' linkClassName='semibold white underline' />

      snackbar.show(<span>Added {tag} to {name}</span>, 'campaigns-batch-tag-success')
    })
  },

  onFavouriteAll () {
    const { snackbar } = this.props
    const { selections } = this.state
    const campaignSlugs = selections.map((c) => c.slug)
    batchFavouriteCampaigns.call({campaignSlugs}, (error) => {
      if (error) {
        console.log(error)
        snackbar.error('campaigns-batch-favourite-error')
      }

      const name = campaignSlugs.length > 1 ? `${campaignSlugs.length} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />

      snackbar.show(<span>Favourited {name}</span>, 'campaigns-batch-favourite-success')
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
        return snackbar.error('campaigns-batch-add-to-campaign-list-failure')
      }

      const name = slugs.length > 1 ? `${slugs.length} campaigns` : <CampaignLink campaign={this.state.selections[0]} linkClassName='semibold white underline' />
      const list = masterLists.length > 1 ? `${masterLists.length} Campaign Lists` : <CampaignListLink campaignList={masterLists[0]} linkClassName='semibold white underline' />

      snackbar.show(<span>Added {name} to {list}</span>, 'campaigns-batch-add-to-campaign-list-success')
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
    const { selections, createCampaignModalOpen } = this.state

    if (!loading && campaignCount === 0) {
      return (<div>
        <CampaignListEmpty
          onAddCampaign={this.toggleCreateCampaignModal}
        />
        <CreateCampaignModal
          onDismiss={this.toggleCreateCampaignModal}
          open={createCampaignModalOpen}
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
              allCount={campaignCount}
              selectedMasterListSlug={selectedMasterListSlug}
              onChange={onMasterListChange} />
          </div>
          <div className='flex-none bg-white center px4'>
            <button className='btn bg-completed white mx4' onClick={this.toggleCreateCampaignModal} data-id='create-campaign-button'>New Campaign</button>
          </div>
        </div>
        <CreateCampaignModal
          onDismiss={this.toggleCreateCampaignModal}
          open={createCampaignModalOpen} />
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
        <AddTagsModal
          type='Campaigns'
          open={this.state.addTagsOpen}
          onDismiss={() => this.setState({addTagsOpen: false})}
          onUpdateTags={this.onTagAll}
          title='Tag these Campaigns'>
          <AbbreviatedAvatarList items={selections} shape='square' />
        </AddTagsModal>
        <AddToMasterList
          type='Campaigns'
          open={this.state.addToMasterListsOpen}
          onDismiss={() => this.setState({addToMasterListsOpen: false})}
          onSave={this.onAddAllToMasterLists}
          title='Add to a Campaign List'>
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
