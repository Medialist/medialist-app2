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

export const Notifications = (props) => {
  return props.notifications.map(function (note, i) {
    return <Notification notification={note} key={i} />
  })
}
