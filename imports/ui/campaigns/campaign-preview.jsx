import React from 'react'
import { TimeFromNow } from '/imports/ui/time/time'
import { SquareAvatar } from '/imports/ui/images/avatar'

const CampaignPreview = ({ name, avatar, client, clientName, contacts, updatedAt }) => {
  let clientDisplay
  let hyphen

  if (client && client.name) {
    clientDisplay = <span>{client.name}</span>
  }

  if (clientName) {
    clientDisplay = <span>{clientName}</span>
  }

  if (clientDisplay && updatedAt) {
    hyphen = <span className='gray40'> &mdash; </span>
  }

  return (
    <div className='flex items-center'>
      <SquareAvatar className='flex-none' size={38} avatar={avatar} name={name} />
      <div className='flex-auto pl3'>
        <div className='f-md semibold gray10 truncate'>{name}</div>
        <div className='f-sm normal gray20 truncate'>
          {clientDisplay}
          {hyphen}
          {updatedAt && <span className='gray40'>{clientDisplay ? 'u' : 'U'}pdated <TimeFromNow date={updatedAt} /></span>}
        </div>
      </div>
    </div>
  )
}

export default CampaignPreview
