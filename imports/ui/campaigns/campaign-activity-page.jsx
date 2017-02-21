import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignTopbar from './campaign-topbar'
import CampaignInfo from './campaign-info'
import CampaignContactList from './campaign-contact-list'
import PostBox from './campaign-postbox'
import ActivityFeed from '../dashboard/activity-feed'
import EditCampaign from './edit-campaign'
import Clients from '/imports/api/clients/clients'
import Campaigns from '/imports/api/campaigns/campaigns'
import Contacts from '/imports/api/contacts/contacts'
import MasterLists from '/imports/api/master-lists/master-lists'
import { setMasterLists } from '/imports/api/master-lists/methods'
import CreateContact from '../contacts/edit-contact'
import AddContact from './add-contact'
import EditTeam from './edit-team'

const CampaignActivityPage = React.createClass({
  propTypes: {
    router: PropTypes.object,
    loading: PropTypes.bool,
    campaign: PropTypes.object,
    user: PropTypes.object,
    contacts: PropTypes.array,
    contactsCount: PropTypes.number,
    contactsAllCount: PropTypes.number
  },

  getInitialState () {
    return {
      createContactModalOpen: false,
      addContactModalOpen: false,
      editModalOpen: false,
      contactPrefillData: null,
      editTeamModalOpen: false
    }
  },

  onAddContactClick () {
    const { contactsAllCount } = this.props

    if (contactsAllCount) {
      const addContactModalOpen = !this.state.addContactModalOpen
      this.setState({ addContactModalOpen })
    } else {
      const createContactModalOpen = !this.state.createContactModalOpen
      this.setState({ createContactModalOpen })
    }
  },

  onCreateContactModalDismiss () {
    this.setState({ createContactModalOpen: false })
  },

  onAddContactModalDismiss () {
    this.setState({ addContactModalOpen: false })
  },

  onAddCampaignToMasterLists ({item, masterLists}) {
    setMasterLists.call({ type: 'Campaigns', item, masterLists })
  },

  toggleEditModal () {
    const editModalOpen = !this.state.editModalOpen
    this.setState({ editModalOpen })
  },

  toggleEditTeamModal () {
    const editTeamModalOpen = !this.state.editTeamModalOpen
    this.setState({ editTeamModalOpen })
  },

  onFeedback ({message, contact, status}, cb) {
    const post = {
      contactSlug: contact.slug,
      campaignSlug: this.props.campaign.slug,
      message,
      status
    }
    Meteor.call('posts/create', post, cb)
  },

  onCoverage ({message, contact}, cb) {
    const post = {
      campaignSlug: this.props.campaign.slug,
      contactSlug: contact.slug,
      message
    }
    Meteor.call('posts/createCoverage', post, cb)
  },

  onCreateContact (data) {
    this.setState({
      addContactModalOpen: false,
      createContactModalOpen: true,
      contactPrefillData: data
    })
  },

  render () {
    const {
      onAddContactClick,
      onCreateContactModalDismiss,
      onAddContactModalDismiss,
      toggleEditModal,
      toggleEditTeamModal,
      onFeedback,
      onCoverage,
      onCreateContact,
      onAddCampaignToMasterLists
    } = this
    const { campaign, contacts, contactsCount, clients, teamMates, loading, user } = this.props
    const {
      createContactModalOpen,
      addContactModalOpen,
      editModalOpen,
      editTeamModalOpen,
      contactPrefillData
    } = this.state

    if (!campaign) return null

    return (
      <div>
        <CampaignTopbar campaign={campaign} onAddContactClick={onAddContactClick} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <CampaignInfo
              campaign={campaign}
              onEditClick={toggleEditModal}
              onEditTeamClick={toggleEditTeamModal}
              user={user}
              onAddCampaignToMasterLists={onAddCampaignToMasterLists} />
            <EditCampaign campaign={campaign} open={editModalOpen} onDismiss={toggleEditModal} clients={clients} />
            <EditTeam campaign={campaign} open={editTeamModalOpen} onDismiss={toggleEditTeamModal} teamMates={teamMates} loading={loading} />
          </div>
          <div className='flex-auto px2' >
            <PostBox campaign={campaign} contacts={contacts} onFeedback={onFeedback} onCoverage={onCoverage} />
            <ActivityFeed campaign={campaign} />
          </div>
          <div className='flex-none xs-hide sm-hide pl4' style={{width: 323}}>
            <CampaignContactList contacts={contacts.slice(0, 7)} contactsCount={contactsCount} campaign={campaign} onAddContactClick={onAddContactClick} />
          </div>
        </div>
        <CreateContact
          open={createContactModalOpen}
          onDismiss={onCreateContactModalDismiss}
          campaign={campaign}
          prefill={contactPrefillData} />
        <AddContact
          open={addContactModalOpen}
          onDismiss={onAddContactModalDismiss}
          onCreate={onCreateContact}
          campaign={campaign}
          campaignContacts={contacts} />
      </div>
    )
  }
})

export default createContainer((props) => {
  const { campaignSlug } = props.params

  const subs = [
    Meteor.subscribe('campaign', campaignSlug),
    Meteor.subscribe('contacts-by-campaign', campaignSlug),
    Meteor.subscribe('contactCount'),
    Meteor.subscribe('clients')
  ]
  const loading = subs.some((s) => !s.ready())
  const campaign = Campaigns.findOne({ slug: campaignSlug })

  return {
    ...props,
    loading,
    campaign,
    // TODO: need to be able to sort contacts by recently updated with respect to the campaign.
    contacts: Contacts.find({campaigns: campaignSlug}, {sort: {updatedAt: -1}}).fetch(),
    contactsCount: Contacts.find({campaigns: campaignSlug}).count(),
    contactsAllCount: window.Counter.get('contactCount'),
    teamMates: campaign && campaign.team,
    user: Meteor.user(),
    clients: Clients.find({}).fetch(),
    masterlists: MasterLists.find({type: 'Campaigns'}).fetch()
  }
}, withRouter(CampaignActivityPage))
