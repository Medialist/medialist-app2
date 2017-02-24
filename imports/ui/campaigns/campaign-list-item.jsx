import React from 'react'
import { TimeFromNow } from '../time/time'
import { SquareAvatar } from '../images/avatar.jsx'
import Status from '../feedback/status-label'

export default (props) => {
  const { name, avatar, client, contacts, updatedAt } = props.campaign
  const { slug } = props.contact
  return (
    <div className='flex items-center'>
      <SquareAvatar avatar={avatar} name={name} />
      <div className='flex-auto ml3'>
        <div className='semibold f-md gray10'>{name}</div>
        <div className='normal f-sm gray20'>
          {client && client.name}
          <span className='ml1 gray40'>- updated <TimeFromNow date={updatedAt} /></span>
        </div>
      </div>
      <div className='flex-none' style={{width: 173}}>
        <Status name={contacts[slug]} />
      </div>
    </div>
  )
}
