import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactTopbar from './contact-topbar'
import ContactInfo from './contact-info'
import ContactNeedToKnowList from './contact-need-to-know-list'
import PostBox from './post-box'
import ActivityFeed from '../dashboard/activity-feed'
import EditContact from './edit-contact'

const ContactPage = React.createClass({
  propTypes: {
    campaigns: PropTypes.array,
    contact: PropTypes.object
  },

  getInitialState () {
    return { editContactOpen: true }
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

  onFeedback ({message, campaign, status}) {
    const post = {
      contactSlug: this.props.contact.slug,
      medialistSlug: campaign.slug,
      message,
      status
    }
    console.log('onFeedBack', post)
    Meteor.call('posts/create', post)
  },

  render () {
    const { contact, campaigns } = this.props
    const { editContactOpen } = this.state
    if (!contact) return null
    return (
      <div>
        <ContactTopbar contact={contact} onAddClick={this.onAddClick} />
        <div className='flex m4 pt4 pl4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 323}}>
            <ContactInfo contact={contact} onEditClick={this.toggleEditContact} />
          </div>
          <div className='flex-auto px2' >
            <PostBox contact={contact} campaigns={campaigns} onFeedback={this.onFeedback} />
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
  const { slug } = props.params
  Meteor.subscribe('contact', slug)
  Meteor.subscribe('medialists')
  const contact = window.Contacts.findOne({ slug })
  const campaigns = contact ? window.Medialists.find({ slug: { $in: contact.medialists } }).fetch() : []
  return { ...props, contact, campaigns }
}, ContactPage)

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
