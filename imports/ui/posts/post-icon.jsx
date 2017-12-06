import React from 'react'

import {
  FeedCampaignIcon,
  FeedContactIcon,
  FeedCoverageIcon,
  FeedFeedbackIcon,
  FeedNeedToKnowIcon,
  StatusUpdateIcon
} from '/imports/ui/images/icons'

const iconMap = {
  FeedbackPost: {icon: FeedFeedbackIcon, color: 'blue-dark'},
  CoveragePost: {icon: FeedCoverageIcon, color: 'blue'},
  NeedToKnowPost: {icon: FeedNeedToKnowIcon, color: 'tangerine'},
  CreateCampaign: {icon: FeedCampaignIcon, color: 'status-blue'},
  StatusUpdate: {icon: StatusUpdateIcon, color: 'gray60'},
  AddContactsToCampaign: {icon: FeedContactIcon, color: 'gray60'}
}

export default ({type, style}) => {
  const {icon: PostIcon, color} = iconMap[type]
  return <PostIcon className={color} style={style} />
}
