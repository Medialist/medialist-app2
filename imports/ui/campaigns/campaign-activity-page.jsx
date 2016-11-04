import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import CampaignTopbar from './campaign-topbar'
import CampaignInfo from './campaign-info'
import CampaignContactList from './campaign-contact-list'
import PostBox from '../contacts/post-box'
import ActivityFeed from '../dashboard/activity-feed'
// import EditCampaign from './edit-campaign'

const CampaignActivityPage = React.createClass({
  propTypes: {
    router: PropTypes.object,
    loading: React.PropTypes.bool,
    campaign: PropTypes.object,
    contacts: PropTypes.array,
    contactsCount: PropTypes.number
  },

  getInitialState () {
    return { editModalOpen: true }
  },

  toggleEditModal () {
    const editModalOpen = !this.state.editModalOpen
    this.setState({ editModalOpen })
  },

  onAddClick () {
    console.log('TODO: Add contact to campaign')
  },

  onBackClick () {
    this.props.router.push(`/campaigns`)
  },

  onFeedback ({message, contact, status}) {
    const post = {
      contactSlug: contact.slug,
      medialistSlug: this.props.campaign.slug,
      message,
      status
    }
    console.log('onFeedBack', post)
    Meteor.call('posts/create', post)
  },

  render () {
    const { campaign, contacts, contactsCount } = this.props
    if (!campaign) return null
    return (
      <div>
        <CampaignTopbar onAddClick={this.onAddClick} onBackClick={this.onBackClick} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <CampaignInfo campaign={campaign} onEditClick={this.toggleEditModal} />
          </div>
          <div className='flex-auto px2' >
            <PostBox campaigns={[campaign]} onFeedback={this.onFeedback} />
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
    Meteor.subscribe('medialist', slug)
  ]
  const loading = subs.some((s) => !s.ready())
  const campaign = window.Medialists.findOne({ slug })
  // TODO: need to be able to sort contacts by recently updated with respect to the campaign.
  const contacts = window.Contacts.find({medialists: slug}, {limit: 7, sort: {updatedAt: -1}}).fetch()
  const contactsCount = window.Contacts.find({medialists: slug}).count()
  return { ...props, campaign, contacts, contactsCount, loading }
}, withRouter(CampaignActivityPage))
