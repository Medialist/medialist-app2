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
  return <span className='blue' style={{margin: '0 13px'}}><Icon /></span>
}

export default ActivityIcon
