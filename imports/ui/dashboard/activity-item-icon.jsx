import React from 'react'
import {
  FeedCampaignIcon,
  FeedContactIcon,
  FeedCoverageIcon,
  FeedFeedbackIcon,
  FeedNeedToKnowIcon
} from '../images/icons'

const iconDir = {
  'campaign created': FeedCampaignIcon,
  'coverage': FeedCoverageIcon,
  'feedback': FeedFeedbackIcon,
  'need-to-knows': FeedNeedToKnowIcon,
  'campaigns changed': FeedContactIcon
}

const ActivityIcon = ({ type }) => {
  const Icon = iconDir[type]
  if (!Icon) return null
  return <span className='blue' style={{marginRight: 13}}><Icon /></span>
}

export default ActivityIcon
