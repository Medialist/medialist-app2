import React from 'react'
import { FeedFeedbackIcon, FeedCoverageIcon, FeedNeedToKnowIcon } from '/imports/ui/images/icons'

const Tab = ({selected, onClick, children, ...props}) => {
  const className = `inline-block pl3 pr4 py3 pointer f-sm semibold ${selected ? 'bg-white shadow-2' : 'gray60'}`
  return (
    <div className={className} onClick={onClick} {...props}>
      {children}
    </div>
  )
}

const style = {paddingLeft: 7, verticalAlign: '-2px'}

export const FeedbackTab = ({selected, onClick}) => (
  <Tab selected={selected} onClick={onClick} data-id='feedback-tab'>
    <FeedFeedbackIcon className={selected ? 'blue-dark' : 'gray60'} />
    <span style={style}>Feedback</span>
  </Tab>
)

export const CoverageTab = ({selected, onClick}) => (
  <Tab selected={selected} onClick={onClick} data-id='coverage-tab'>
    <FeedCoverageIcon className={selected ? 'blue-dark' : 'gray60'} />
    <span style={style}>Coverage</span>
  </Tab>
)

export const NeedToKnowTab = ({selected, onClick}) => (
  <Tab selected={selected} onClick={onClick} data-id='need-to-know-tab'>
    <FeedNeedToKnowIcon className={selected ? 'tangerine' : 'gray60'} />
    <span style={style}>Need to Know</span>
  </Tab>
)

export const PostBoxTabs = ({children}) => (
  <nav style={{display: 'block', padding: '2px 1px 0', height: 50, overflowY: 'hidden'}}>
    {children}
  </nav>
)
