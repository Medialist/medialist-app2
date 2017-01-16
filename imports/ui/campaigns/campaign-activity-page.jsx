import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignTopbar from './campaign-topbar'
import CampaignInfo from './campaign-info'
import CampaignContactList from './campaign-contact-list'
import PostBox from '../contacts/post-box'
import ActivityFeed from '../dashboard/activity-feed'
import EditCampaign from './edit-campaign'
import Clients from '/imports/api/clients/clients'
import Medialists from '/imports/api/medialists/medialists'

const CampaignActivityPage = React.createClass({
  propTypes: {
    router: PropTypes.object,
    loading: React.PropTypes.bool,
    campaign: PropTypes.object,
    user: PropTypes.object,
    contacts: PropTypes.array,
    contactsAll: PropTypes.array,
    contactsCount: PropTypes.number
  },

  getInitialState () {
    return { editModalOpen: false }
  },

  toggleEditModal () {
    const editModalOpen = !this.state.editModalOpen
    this.setState({ editModalOpen })
  },

  onFeedback ({message, contact, status}) {
    const post = {
      contactSlug: contact.slug,
      medialistSlug: this.props.campaign.slug,
      message,
      status
    }
    Meteor.call('posts/create', post)
  },

  render () {
    const { toggleEditModal, onFeedback } = this
    const { campaign, contacts, contactsCount, clients, contactsAll, user } = this.props
    const { editModalOpen } = this.state
    if (!campaign) return null

    return (
      <div>
        <CampaignTopbar contactsAll={contactsAll} campaign={campaign} contacts={contacts} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <CampaignInfo campaign={campaign} onEditClick={toggleEditModal} user={user} />
            <EditCampaign campaign={campaign} open={editModalOpen} onDismiss={toggleEditModal} clients={clients} />
          </div>
          <div className='flex-auto px2' >
            <PostBox campaigns={[campaign]} onFeedback={onFeedback} />
            <ActivityFeed campaign={campaign} />
          </div>
          <div className='flex-none xs-hide sm-hide pl4' style={{width: 323}}>
            <CampaignContactList contacts={contacts} contactsCount={contactsCount} campaign={campaign} />
          </div>
        </div>
      </div>
    )
  }
})

export default createContainer((props) => {
  const { slug } = props.params

  const subs = [
    Meteor.subscribe('medialist', slug),
    Meteor.subscribe('contacts'),
    Meteor.subscribe('clients')
  ]
  const loading = subs.some((s) => !s.ready())

  return {
    ...props,
    loading,
    campaign: Medialists.findOne({ slug }),
    // TODO: need to be able to sort contacts by recently updated with respect to the campaign.
    contacts: window.Contacts.find({medialists: slug}, {limit: 7, sort: {updatedAt: -1}}).fetch(),
    contactsCount: window.Contacts.find({medialists: slug}).count(),
    contactsAll: window.Contacts.find({}, {sort: {name: 1}}).fetch(),
    user: Meteor.user(),
    clients: Clients.find({}).fetch()
  }
}, withRouter(CampaignActivityPage))
