import React from 'react'
import { TimeFromNow } from '../time/time'
import { SquareAvatar } from '../images/avatar.jsx'

export default ({ name, avatar, client, clientName, contacts, updatedAt }) => (
  <div className='flex items-center'>
    <SquareAvatar className='flex-none' size={38} avatar={avatar} name={name} />
    <div className='flex-auto pl3'>
      <div className='f-md semibold gray10 truncate'>{name}</div>
      <div className='f-sm normal gray20 truncate'>
        {clientName && <span>{clientName} - </span>}
        {client && client.name && <span>{client.name} - </span>}
        {updatedAt && <span className='gray40'>updated <TimeFromNow date={updatedAt} /></span>}
      </div>
    </div>
  </div>
)
