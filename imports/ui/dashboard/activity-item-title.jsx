import React from 'react'
import { Link } from 'react-router'
import YouOrName from '../users/you-or-name'
import Status from '../feedback/status'
import { ChevronRight } from '../images/icons'

const ActivityItemTitle = ({ item, currentUser }) => {
  const { type, message, contacts, medialists, status, createdBy } = item

  if (type === 'need to know') {
    return (
      <span className='gray10'>
        <YouOrName className='semibold' currentUser={currentUser} user={createdBy} />
        {'  '} for {contacts[0].name}
      </span>
    )
  }

  if (['details changed', 'medialists changed', 'campaign created'].includes(type)) {
    return (
      <span className='gray10'>
        <YouOrName className='semibold' currentUser={currentUser} user={createdBy} />
        {'  '} {message}
      </span>
    )
  }

  if (item.type === 'feedback') {
    return (
      <span className='flex' style={{height: 19}}>
        <YouOrName className='semibold flex-none' currentUser={currentUser} user={createdBy} />
        <span className='flex-auto truncate'>
          <span className='gray10 ml1'>logged feedback </span>
          <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
          <Link className='semibold gray10' to={`/campaigns/${encodeURIComponent(medialists[0])}`}>{medialists[0]}</Link>
          <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
          <span className='semibold gray10'>{contacts[0].name}</span>
        </span>
        <span className='flex-none self-end'><Status status={status} /></span>
      </span>
    )
  }

  if (item.type === 'coverage') {
    return (
      <span>
        <YouOrName currentUser={currentUser} user={createdBy} />
        <span className='gray10'> logged coverage </span>
        <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
        <Link className='semibold gray10' to={`/campaigns/${encodeURIComponent(medialists[0])}`}>{medialists[0]}</Link>
        <span className='f-xxxs gray60 mx1'><ChevronRight /></span>
        <span className='semibold gray10'>{contacts[0].name}</span>
      </span>
    )
  }

  return null
}

export default ActivityItemTitle
