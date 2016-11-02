import React, { PropTypes } from 'react'
import fromNow from '../time/from-now'
import { CircleAvatar } from '../images/avatar'
import {
  FeedCampaignIcon,
  FeedCoverageIcon,
  FeedNeedToKnowIcon
} from '../images/icons'

const icons = {
  FeedCampaignIcon: <FeedCampaignIcon />,
  FeedCoverageIcon: <FeedCoverageIcon />,
  FeedNeedToKnowIcon: <FeedNeedToKnowIcon />
}

export const Notification = React.createClass({
  propTypes: {
    notification: PropTypes.object
  },
  render () {
    const note = this.props.notification

    return (
      <div className={`flex items-center py3 px2 border-top border-gray80 hover-bg-gray90 ${note.read ? 'bg-blue-lighter' : 'bg-white'}`}>
        <CircleAvatar name={note.name} avatar={note.avatar} className='flex-none ml2' />
        <div className='flex-none mx2'>{icons[note.icon]}</div>
        <div className='flex-auto no-select'>
          <strong>{note.name}</strong>
          <span>&nbsp;{note.notification}&nbsp;</span>
          <strong>{note.campaign}</strong>
        </div>
        <div className={`flex-none mx2 ${note.read ? 'blue' : ''}`}>{fromNow({date: new Date(note.time)})}</div>
      </div>
    )
  }
})

export const Notifications = React.createClass({
  propTypes: { notifications: PropTypes.array.isRequired },
  render () {
    return <div>{this.props.notifications.map((note, i) => <Notification notification={note} key={i} />)}</div>
  }
})

export const NotificationSummary = React.createClass({
  propTypes: {
    notifications: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired
  },
  render () {
    const { notifications, onClick } = this.props
    const unread = notifications.filter((n) => !!n.read)

    return (
      <div className='flex items-center my3 pa3'>
        <div className='flex-none'>
          <span className='ml2 px2 py1 bg-not-interested circle inline-block white'>{unread.length}</span>
          <span className='px1'>Unread notifications</span>
        </div>
        <hr className='flex-auto' style={{opacity: 0}} />
        <span className='mr2 flex-none blue no-select pointer' onClick={onClick}>Mark all as read</span>
      </div>
    )
  }
})
