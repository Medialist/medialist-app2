import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import Contacts from '/imports/api/contacts/contacts'
import Medialists from '/imports/api/medialists/medialists'
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
    const post = {
      contactSlug: this.props.contact.slug,
      medialistSlug: campaign.slug,
      message,
      status
    }
    Meteor.call('posts/create', post, cb)
  },

  onCoverage ({message, campaign}, cb) {
    const post = {
      contactSlug: this.props.contact.slug,
      medialistSlug: campaign.slug,
      message
    }
    Meteor.call('posts/createCoverage', post, cb)
  },

  render () {
    const { contact, campaigns, user, masterlists } = this.props
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
  Meteor.subscribe('medialists')
  const contact = Contacts.findOne({ slug: contactSlug })
  const campaigns = contact ? Medialists.find({ slug: { $in: contact.medialists } }).fetch() : []
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
