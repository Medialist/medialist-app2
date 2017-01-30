import React from 'react'
import { FeedFeedbackIcon, FeedCoverageIcon } from '../images/icons'

const ActivityIcon = ({ type }) => {
  let Icon
  if (type === 'feedback') Icon = FeedFeedbackIcon
  if (type === 'coverage') Icon = FeedCoverageIcon
  if (!type) Icon = FeedFeedbackIcon
  if (!Icon) return null
  return <span className='ml2 blue'><Icon /></span>
}

export default ActivityIcon
