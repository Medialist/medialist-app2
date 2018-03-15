import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { Session } from 'meteor/session'
import { createFeedbackPost, createCoveragePost, createNeedToKnowPost } from '/imports/api/posts/methods'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import MasterLists from '/imports/api/master-lists/master-lists'
import { findPinnedNeedToKnows } from '/imports/api/posts/queries'
import { createContainer } from 'meteor/react-meteor-data'
import ContactTopbar from '/imports/ui/contacts/contact-topbar'
import ContactInfo from '/imports/ui/contacts/contact-info'
import ContactNeedToKnowList from '/imports/ui/contacts/contact-need-to-know-list'
import PostBox from '/imports/ui/feedback/post-box'
import ActivityFeed from '/imports/ui/dashboard/activity-feed'
import { EditContactModal } from '/imports/ui/contacts/edit-contact'
import AddContactToCampaign from '/imports/ui/contacts/add-to-campaign/add-one-modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { LoadingBar } from '/imports/ui/lists/loading'

const ContactPage = withSnackbar(React.createClass({
  propTypes: {
    router: PropTypes.object,
    campaigns: PropTypes.array,
    contact: PropTypes.object,
    campaign: PropTypes.object,
    user: PropTypes.object,
    masterlists: PropTypes.array,
    needToKnows: PropTypes.array,
    loading: PropTypes.bool.isRequired,
    snackbar: PropTypes.object.isRequired
  },

  getInitialState () {
    return {
      editContactModalOpen: false,
      addToCampaignOpen: false
    }
  },

  toggleEditContactModal () {
    this.setState((s) => ({ editContactModalOpen: !s.editContactModalOpen }))
  },

  toggleAddToCampaign () {
    this.setState((s) => ({ addToCampaignOpen: !s.addToCampaignOpen }))
  },

  onFeedback ({message, campaign, status}, cb) {
    const contactSlug = this.props.contact.slug
    const campaignSlug = campaign.slug
    createFeedbackPost.call({contactSlug, campaignSlug, message, status}, cb)
  },

  onCoverage ({message, campaign, status}, cb) {
    const contactSlug = this.props.contact.slug
    const campaignSlug = campaign.slug
    createCoveragePost.call({contactSlug, campaignSlug, message, status}, cb)
  },

  onNeedToKnow ({message, pinned}, cb) {
    const contactSlug = this.props.contact.slug
    createNeedToKnowPost.call({contactSlug, message, pinned}, cb)
  },

  render () {
    const { contact, campaigns, campaign, user, masterlists, needToKnows, loading } = this.props
    const { editContactModalOpen, addToCampaignOpen } = this.state

    if (!contact) {
      return <LoadingBar />
    }

    if (loading) {
      return (
        <div>
          <ContactTopbar contact={contact} onAddToCampaignClick={this.toggleAddToCampaign} />
          <LoadingBar />
        </div>
      )
    }

    return (
      <div>
        <ContactTopbar contact={contact} onAddToCampaignClick={this.toggleAddToCampaign} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <ContactInfo
              campaigns={campaigns}
              contact={contact}
              user={user}
              masterlists={masterlists}
              onEditClick={this.toggleEditContactModal}
              onAddToCampaignClick={this.toggleAddToCampaign}
            />
          </div>
          <div className='flex-auto px2' >
            <PostBox
              loading={loading}
              contact={contact}
              campaigns={campaigns}
              campaign={campaign}
              onFeedback={this.onFeedback}
              onCoverage={this.onCoverage}
              onNeedToKnow={this.onNeedToKnow}
            />
            <ActivityFeed data-id='contact-activity-feed' contact={contact} />
          </div>
          <div data-id='need-to-knows-list' className='flex-none xs-hide sm-hide pl4' style={{width: 323}}>
            <ContactNeedToKnowList items={needToKnows} />
          </div>
        </div>
        <EditContactModal
          open={editContactModalOpen}
          onDismiss={this.toggleEditContactModal}
          contact={contact} />
        <AddContactToCampaign
          title={`Add ${contact.name.split(' ')[0]} to a Campaign`}
          onDismiss={this.toggleAddToCampaign}
          open={addToCampaignOpen}
          contact={contact} />
      </div>
    )
  }
}))

export default createContainer((props) => {
  const { contactSlug } = props.params
  const campaignSlug = Session.get('lastCampaignVisitedSlug')
  const subs = [
    Meteor.subscribe('contact-page', contactSlug),
    Meteor.subscribe('pinned-need-to-knows', contactSlug)
  ]
  const user = Meteor.user()
  const contact = Contacts.findOne({
    slug: contactSlug
  })
  const campaign = Campaigns.findOne({
    slug: campaignSlug
  })
  const campaigns = contact ? Campaigns.find({
    slug: {
      $in: contact.campaigns
    }
  }, {
    sort: {
      updatedAt: -1
    }
  }).fetch() : []
  const masterlists = MasterLists.find({type: 'Contacts'}).fetch()
  const needToKnows = findPinnedNeedToKnows(contactSlug).fetch()
  const loading = subs.some((s) => !s.ready())
  return { ...props, contact, campaigns, campaign, user, masterlists, needToKnows, loading }
}, withRouter(ContactPage))
