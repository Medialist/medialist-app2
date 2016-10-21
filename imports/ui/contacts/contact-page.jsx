import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactTopbar from './contact-topbar'
import ContactNeedToKnowList from './contact-need-to-know-list'

const ContactsPage = React.createClass({
  propTyeps: {
    contact: PropTypes.object
  },

  onAddClick () {
    console.log('TODO: Add contact to campaign')
  },

  render () {
    const { contact } = this.props
    return (
      <div>
        <ContactTopbar contact={contact} onAddClick={this.onAddClick} />
        <div className='flex max-width-lg mx-auto my4'>
          <div className='flex-none mr4 xs-hide sm-hide' style={{width: 250}}>
            LEFT
          </div>
          <div className='flex-auto px2'>
            MIDDLE
          </div>
          <div className='flex-none xs-hide sm-hide' style={{width: 250}}>
            <ContactNeedToKnowList items={needToKnows} />
          </div>
        </div>
      </div>
    )
  }
})

export default createContainer((props) => {
  const { slug } = props.params
  Meteor.subscribe('contact', slug)
  return { ...props, contact: window.Contacts.findOne({ slug }) }
}, ContactsPage)

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
