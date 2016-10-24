import React from 'react'
import { AllTypesIcon, FeedCoverageIcon, FeedNeedToKnowIcon } from '../images/icons'

export const TopActivityFilter = () => <span><AllTypesIcon /><span className='ml2'>Top Activity</span></span>
export const CoverageFilter = () => <span><FeedCoverageIcon /><span className='ml2'>Coverage</span></span>
export const NeedToKnowFilter = () => <span><FeedNeedToKnowIcon /><span className='ml2'>Need-to-knows</span></span>
