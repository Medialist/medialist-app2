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
import Medialists from '/imports/api/medialists/medialists'
import AddContact from './add-contact'
import EditTeam from './edit-team'

const CampaignActivityPage = React.createClass({
  propTypes: {
    router: PropTypes.object,
    loading: PropTypes.bool,
    campaign: PropTypes.object,
    user: PropTypes.object,
    contacts: PropTypes.array,
    contactsAll: PropTypes.array,
    contactsCount: PropTypes.number
  },

  getInitialState () {
    return { addContactOpen: false, editModalOpen: false, editTeamModalOpen: false }
  },

  toggleAddContact () {
    const addContactOpen = !this.state.addContactOpen
    this.setState({ addContactOpen })
  },

  toggleEditModal () {
    const editModalOpen = !this.state.editModalOpen
    this.setState({ editModalOpen })
  },

  toggleEditTeamModal () {
    const editTeamModalOpen = !this.state.editTeamModalOpen
    this.setState({ editTeamModalOpen })
  },

  onBackClick () {
    this.props.router.push(`/campaigns`)
  },

  onFeedback ({message, contact, status}, cb) {
    const post = {
      contactSlug: contact.slug,
      medialistSlug: this.props.campaign.slug,
      message,
      status
    }
    Meteor.call('posts/create', post, cb)
  },

  onCoverage ({message, contact}, cb) {
    const post = {
      medialistSlug: this.props.campaign.slug,
      contactSlug: contact.slug,
      message
    }
    Meteor.call('posts/createCoverage', post, cb)
  },

  render () {
    const { toggleAddContact, toggleEditModal, toggleEditTeamModal, onBackClick, onFeedback, onCoverage } = this
    const { campaign, contacts, contactsCount, clients, contactsAll, teamMates, teamMatesAll, user } = this.props
    const { addContactOpen, editModalOpen, editTeamModalOpen } = this.state
    if (!campaign) return null

    return (
      <div>
        <CampaignTopbar onBackClick={onBackClick} contactsAll={contactsAll} campaign={campaign} contacts={contacts} onAddContactClick={toggleAddContact} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <CampaignInfo campaign={campaign} onEditClick={toggleEditModal} onEditTeamClick={toggleEditTeamModal} user={user} />
            <EditCampaign campaign={campaign} open={editModalOpen} onDismiss={toggleEditModal} clients={clients} />
            <EditTeam campaign={campaign} open={editTeamModalOpen} onDismiss={toggleEditTeamModal} teamMates={teamMates} teamMatesAll={teamMatesAll} />
          </div>
          <div className='flex-auto px2' >
            <PostBox campaign={campaign} contacts={contacts} onFeedback={onFeedback} onCoverage={onCoverage} />
            <ActivityFeed campaign={campaign} />
          </div>
          <div className='flex-none xs-hide sm-hide pl4' style={{width: 323}}>
            <CampaignContactList contacts={contacts} contactsAll={contactsAll} contactsCount={contactsCount} campaign={campaign} onAddContactClick={toggleAddContact} />
          </div>
        </div>
        <AddContact onDismiss={toggleAddContact} open={addContactOpen} contacts={contacts} contactsAll={contactsAll} campaign={campaign} />
      </div>
    )
  }
})

export default createContainer((props) => {
  const { campaignSlug } = props.params

  const subs = [
    Meteor.subscribe('medialist', campaignSlug),
    Meteor.subscribe('contacts'),
    Meteor.subscribe('clients'),
    Meteor.subscribe('users')
  ]
  const loading = subs.some((s) => !s.ready())
  const campaign = Medialists.findOne({ slug: campaignSlug })

  return {
    ...props,
    loading,
    campaign,
    // TODO: need to be able to sort contacts by recently updated with respect to the campaign.
    contacts: window.Contacts.find({medialists: campaignSlug}, {limit: 7, sort: {updatedAt: -1}}).fetch(),
    contactsCount: window.Contacts.find({medialists: campaignSlug}).count(),
    contactsAll: window.Contacts.find({}, {sort: {name: 1}}).fetch(),
    teamMates: campaign && campaign.team,
    teamMatesAll: window.Meteor.users.find({}, {sort: {'profile.name': 1}}).fetch(),
    user: Meteor.user(),
    clients: Clients.find({}).fetch()
  }
}, withRouter(CampaignActivityPage))
