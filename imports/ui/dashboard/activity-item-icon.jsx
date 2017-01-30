import React from 'react'
import { FeedFeedbackIcon, FeedCoverageIcon, FeedNeedToKnowIcon } from '../images/icons'

const iconDir = {
  'feedback': FeedFeedbackIcon,
  'coverage': FeedCoverageIcon,
  'need-to-knows': FeedNeedToKnowIcon
}

const ActivityIcon = ({ type }) => {
  const Icon = iconDir[type]
  if (!Icon) return null
  return <span className='ml2 blue'><Icon /></span>
}

export default ActivityIcon
