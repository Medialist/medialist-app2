import React from 'react'
import { TimeFromNow } from '../time/time'
import { SquareAvatar } from '../images/avatar.jsx'
import StatusLabel from '../feedback/status-label'

export default (props) => {
  const { name, avatar, client, contacts, updatedAt } = props.campaign
  const slug = props.contact ? props.contact.slug : null
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

const Status = ({ name }) => {
  if (!name) return null
  return <StatusLabel name={name} />
}
