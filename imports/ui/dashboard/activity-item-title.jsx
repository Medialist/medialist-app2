import React from 'react'
import { Link } from 'react-router'
import YouOrName from '../users/you-or-name'
import Status from '../feedback/status'
import { ChevronRight } from '../images/icons'

const ItemLink = ({urlRoot, name, slug}) => {
  const to = `/${urlRoot}/${encodeURIComponent(slug)}`
  return <Link className='semibold gray10' to={to}>{name}</Link>
}

const ActivityItemTitle = ({ item, currentUser }) => {
  const { type, message, contacts, campaigns, status, createdBy } = item

  if (type === 'NeedToKnowPost') {
    return (
      <span className='gray10'>
        <YouOrName className='semibold' currentUser={currentUser} user={createdBy} />
        {'  '} for {contacts[0].name}
      </span>
    )
  }

  if (['CampaignChanged', 'CampaignCreated'].includes(type)) {
    return (
      <span className='gray10'>
        <YouOrName className='semibold' currentUser={currentUser} user={createdBy} />
        {'  '} {message}
      </span>
    )
  }

  if (item.type === 'FeedbackPost') {
    const campaign = campaigns[0]
    const contact = contacts[0]
    return (
      <span className='flex' style={{height: 19}}>
        <YouOrName className='semibold flex-none' currentUser={currentUser} user={createdBy} />
        <span className='flex-auto' style={{whiteSpace: 'nowrap'}}>
          <span className='inline-block truncate align-middle'>
            <span className='gray10 ml1'>logged feedback </span>
            <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
            <ItemLink urlRoot='campaign' {...campaign} />
            <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
            <ItemLink urlRoot='contact' {...contact} />
          </span>
          <span className='inline-block align-middle'><Status status={status} /></span>
        </span>
      </span>
    )
  }

  if (item.type === 'CoveragePost') {
    const campaign = campaigns[0]
    const contact = contacts[0]
    return (
      <span>
        <YouOrName currentUser={currentUser} user={createdBy} />
        <span className='gray10'> logged coverage </span>
        <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
        <ItemLink urlRoot='campaign' {...campaign} />
        <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
        <ItemLink urlRoot='contact' {...contact} />
      </span>
    )
  }

  return null
}

export default ActivityItemTitle
