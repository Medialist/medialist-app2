import React from 'react'
import { TimeFromNow } from '../time/time'
import { SquareAvatar } from '../images/avatar.jsx'

export default ({ name, avatar, client, clientName, contacts, updatedAt }) => (
  <div className='flex items-center'>
    <SquareAvatar className='flex-none' size={38} avatar={avatar} name={name} />
    <div className='flex-auto ml3'>
      <div className='semibold f-md gray10 truncate'>{name}</div>
      <div className='normal f-sm gray20 truncate'>
        {clientName && <span>{clientName} - </span>}
        {client && client.name && <span>{client.name} - </span>}
        {updatedAt && <span className='gray40'>updated <TimeFromNow date={updatedAt} /></span>}
      </div>
    </div>
  </div>
)
