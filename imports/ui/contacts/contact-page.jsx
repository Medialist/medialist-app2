import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createFeedbackPost, createCoveragePost } from '/imports/api/posts/methods'
import Contacts from '/imports/api/contacts/contacts'
import Campaigns from '/imports/api/campaigns/campaigns'
import MasterLists from '/imports/api/master-lists/master-lists'
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
    user: PropTypes.object,
    masterlists: PropTypes.array
  },

  getInitialState () {
    return { editContactOpen: false }
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

  onAddClick () {
    console.log('TODO: Add contact to campaign')
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

  render () {
    const { contact, campaigns, user, masterlists } = this.props
    const { editContactOpen } = this.state
    if (!contact) return null
    return (
      <div>
        <ContactTopbar contact={contact} onAddClick={this.onAddClick} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <ContactInfo contact={contact} onEditClick={this.toggleEditContact} user={user} masterlists={masterlists} />
          </div>
          <div className='flex-auto px2' >
            <PostBox contact={contact} campaigns={campaigns} onFeedback={this.onFeedback} onCoverage={this.onCoverage} />
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
  const { contactSlug } = props.params
  Meteor.subscribe('contact', contactSlug)
  Meteor.subscribe('campaigns')
  const contact = Contacts.findOne({ slug: contactSlug })
  const campaigns = contact ? Campaigns.find({ slug: { $in: contact.campaigns } }).fetch() : []
  const user = Meteor.user()
  const masterlists = MasterLists.find({type: 'Contacts'}).fetch()
  return { ...props, contact, campaigns, user, masterlists }
}, withRouter(ContactPage))

const needToKnows = [
  {
    message: 'Don\'t contact Erik via phone!! He will only respond to emails.',
    createdAt: new Date(),
    createdBy: {
      name: 'Shane Hickey',
      avatar: 'https://pbs.twimg.com/profile_images/3573378367/18acf749cba48ef23425bf2ee361c413_normal.jpeg'
    }
  },
  {
    message: 'Had coffee with Will this morning. Stuff.tv is looking for start-up stories for its new business section.',
    createdAt: new Date(),
    createdBy: {
      name: 'Charlotte Meredith',
      avatar: 'https://pbs.twimg.com/profile_images/662436626975563776/xkXgN7zJ_normal.jpg'
    }
  },
  {
    message: 'Weekend is sacred to him. Don\'t even try.',
    createdAt: new Date(),
    createdBy: {
      name: 'Sarah Marshall',
      avatar: 'https://pbs.twimg.com/profile_images/687648874241069056/Hjv0KpcX_normal.jpg'
    }
  },
  {
    message: 'Don\'t contact Erik via phone!! He will only respond to emails.',
    createdAt: new Date(),
    createdBy: {
      name: 'Shane Hickey',
      avatar: 'https://pbs.twimg.com/profile_images/3573378367/18acf749cba48ef23425bf2ee361c413_normal.jpeg'
    }
  },
  {
    message: 'Had coffee with Will this morning. Stuff.tv is looking for start-up stories for its new business section.',
    createdAt: new Date(),
    createdBy: {
      name: 'Charlotte Meredith',
      avatar: 'https://pbs.twimg.com/profile_images/662436626975563776/xkXgN7zJ_normal.jpg'
    }
  },
  {
    message: 'Weekend is sacred to him. Don\'t even try.',
    createdAt: new Date(),
    createdBy: {
      name: 'Sarah Marshall',
      avatar: 'https://pbs.twimg.com/profile_images/687648874241069056/Hjv0KpcX_normal.jpg'
    }
  },
  {
    message: 'Don\'t contact Erik via phone!! He will only respond to emails.',
    createdAt: new Date(),
    createdBy: {
      name: 'Shane Hickey',
      avatar: 'https://pbs.twimg.com/profile_images/3573378367/18acf749cba48ef23425bf2ee361c413_normal.jpeg'
    }
  },
  {
    message: 'Had coffee with Will this morning. Stuff.tv is looking for start-up stories for its new business section.',
    createdAt: new Date(),
    createdBy: {
      name: 'Charlotte Meredith',
      avatar: 'https://pbs.twimg.com/profile_images/662436626975563776/xkXgN7zJ_normal.jpg'
    }
  },
  {
    message: 'Weekend is sacred to him. Don\'t even try.',
    createdAt: new Date(),
    createdBy: {
      name: 'Sarah Marshall',
      avatar: 'https://pbs.twimg.com/profile_images/687648874241069056/Hjv0KpcX_normal.jpg'
    }
  }
]
