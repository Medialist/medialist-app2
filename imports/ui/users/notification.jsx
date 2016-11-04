import React, { PropTypes } from 'react'
import fromNow from '../time/from-now'
import { CircleAvatar } from '../images/avatar'
import {
  FeedCampaignIcon,
  FeedCoverageIcon,
  FeedNeedToKnowIcon
} from '../images/icons'

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

export const Notifications = (props) => {
  const { notifications, className } = props
  return (
    <div className={className}>
      {notifications.map((notification, key) => {
        return <Notification notification={notification} key={key} />
      })}
    </div>
  )
}

Notifications.PropTypes = {
  notifications: PropTypes.array.isRequired,
  className: PropTypes.string
}

export const NotificationsSummary = (props) => {
  const { notifications, onMarkAllReadClick } = props
  const unread = notifications.filter((n) => !!n.read)
  return (
    <div className='flex items-center my3 pa3'>
      <div className='flex-none'>
        <span className='ml2 px2 py1 bg-not-interested circle inline-block white'>{unread.length}</span>
        <span className='px1'>Unread notifications</span>
      </div>
      <hr className='flex-auto' style={{opacity: 0}} />
      <span className='mr2 flex-none blue no-select pointer' onClick={onMarkAllReadClick}>Mark all as read</span>
    </div>
  )
}

NotificationsSummary.propTypes = {
  notifications: PropTypes.array.isRequired,
  onMarkAllReadClick: PropTypes.func.isRequired
}

// mock icons in lieu of a data source
const icons = {
  FeedCampaignIcon: <FeedCampaignIcon />,
  FeedCoverageIcon: <FeedCoverageIcon />,
  FeedNeedToKnowIcon: <FeedNeedToKnowIcon />
}
