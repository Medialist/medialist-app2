import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createFeedbackPost, createCoveragePost, createNeedToKnowPost } from '/imports/api/posts/methods'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import MasterLists from '/imports/api/master-lists/master-lists'
import Posts from '/imports/api/posts/posts'
import { createContainer } from 'meteor/react-meteor-data'
import ContactTopbar from './contact-topbar'
import ContactInfo from './contact-info'
import ContactNeedToKnowList from './contact-need-to-know-list'
import PostBox from '../feedback/post-box'
import ActivityFeed from '../dashboard/activity-feed'
import EditContact from './edit-contact'

const ContactPage = React.createClass({
  propTypes: {
    router: PropTypes.object,
    campaigns: PropTypes.array,
    contact: PropTypes.object,
    campaign: PropTypes.object,
    user: PropTypes.object,
    masterlists: PropTypes.array,
    needToKnows: PropTypes.array,
    loading: PropTypes.bool.isRequired
  },

  getInitialState () {
    return {
      editContactOpen: false,
      addContactModalOpen: false
    }
  },

  componentDidMount () {
    const { location: { pathname, query }, router } = this.props
    if (query && query.editContactOpen) {
      this.setState({ editContactOpen: true })
      router.replace(pathname)
    }
  },

  toggleEditContact () {
    const editContactOpen = !this.state.editContactOpen
    this.setState({ editContactOpen })
  },

  onEditContact (contact) {
    console.log('onEditContact', contact)
  },

  onAddContactToCampaign () {
    this.setState(({ addContactModalOpen }) => ({ addContactModalOpen: true }))
  },

  onDismissAddContactToCampaign () {
    this.setState(({ addContactModalOpen }) => ({ addContactModalOpen: false }))
  },

  onFeedback ({message, campaign, status}, cb) {
    const contactSlug = this.props.contact.slug
    const campaignSlug = campaign.slug
    console.log({contactSlug, campaignSlug, message, status})
    createFeedbackPost.call({contactSlug, campaignSlug, message, status}, cb)
  },

  onCoverage ({message, campaign, status}, cb) {
    const contactSlug = this.props.contact.slug
    const campaignSlug = campaign.slug
    createCoveragePost.call({contactSlug, campaignSlug, message, status}, cb)
  },

  onNeedToKnow ({message}, cb) {
    const contactSlug = this.props.contact.slug
    createNeedToKnowPost.call({contactSlug, message}, cb)
  },

  render () {
    const { contact, campaigns, campaign, user, masterlists, needToKnows, loading } = this.props
    const { editContactOpen, addContactModalOpen } = this.state
    const { onDismissAddContactToCampaign, onAddContactToCampaign } = this
    if (!contact) return null
    return (
      <div>
        <ContactTopbar contact={contact} open={addContactModalOpen} onAddContactToCampaign={onAddContactToCampaign} onDismiss={onDismissAddContactToCampaign} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <ContactInfo contact={contact} onEditClick={this.toggleEditContact} user={user} masterlists={masterlists} />
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
            <ActivityFeed contact={contact} />
          </div>
          <div className='flex-none xs-hide sm-hide pl4' style={{width: 323}}>
            <ContactNeedToKnowList items={needToKnows} />
          </div>
        </div>
        <EditContact open={editContactOpen} onSubmit={this.onEditContact} onDismiss={this.toggleEditContact} contact={contact} />}
      </div>
    )
  }
})

export default createContainer((props) => {
  const { contactSlug, campaignSlug } = props.params
  const subs = [
    Meteor.subscribe('contact', contactSlug),
    Meteor.subscribe('campaigns'),
    Meteor.subscribe('need-to-knows', {
      contact: contactSlug
    })
  ]
  const user = Meteor.user()
  const contact = Contacts.findOne({ slug: contactSlug })
  const campaign = Campaigns.findOne({ slug: campaignSlug })
  const campaigns = contact ? Campaigns.find({ slug: { $in: contact.campaigns } }).fetch() : []
  const masterlists = MasterLists.find({type: 'Contacts'}).fetch()
  const needToKnows = Posts.find(
    { type: 'NeedToKnowPost', 'contacts.slug': contactSlug },
    { sort: { createdAt: -1 } }
  ).fetch()
  const loading = subs.some((s) => !s.ready())
  return { ...props, contact, campaigns, campaign, user, masterlists, needToKnows, loading }
}, withRouter(ContactPage))
