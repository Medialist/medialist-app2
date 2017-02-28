import React from 'react'
import { FeedFeedbackIcon, FeedCoverageIcon, FeedNeedToKnowIcon } from '../images/icons'

const Tab = ({selected, onClick, children}) => {
  const className = `inline-block pl3 pr4 py3 pointer f-sm semibold ${selected ? 'bg-white shadow-2' : 'gray60'}`
  return (
    <div className={className} onClick={onClick} >
      {children}
    </div>
  )
}

const style = {paddingLeft: 7, verticalAlign: '-1px'}

export const FeedbackTab = ({selected, onClick}) => (
  <Tab selected={selected} onClick={onClick} >
    <FeedFeedbackIcon className={selected ? 'blue-dark' : 'gray60'} />
    <span style={style}>Feedback</span>
  </Tab>
)

export const CoverageTab = ({selected, onClick}) => (
  <Tab selected={selected} onClick={onClick} >
    <FeedCoverageIcon className={selected ? 'blue-dark' : 'gray60'} />
    <span style={style}>Coverage</span>
  </Tab>
)

export const NeedToKnowTab = ({selected, onClick}) => (
  <Tab selected={selected} onClick={onClick} >
    <FeedNeedToKnowIcon className={selected ? 'orange' : 'gray60'} />
    <span style={style}>Need-to-know</span>
  </Tab>
)

export const PostBoxTabs = ({children}) => (
  <nav style={{display: 'block', padding: '2px 1px 0', height: 50, overflowY: 'hidden'}}>
    {children}
  </nav>
)
