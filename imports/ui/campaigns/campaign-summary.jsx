import React from 'react'
import values from 'lodash.values'
import { SquareAvatar } from '../images/avatar'
import { StatusValues } from '/imports/api/contacts/status'

export default (props) => {
  const { contacts, name, avatar } = props.campaign
  const statuses = values(contacts || [])
  // { 'Completed': 10, 'Hot Lead': 3, etc}
  const counts = statuses.reduce((counts, s) => {
    if (!counts[s]) counts[s] = 0
    counts[s] = counts[s] + 1
    return counts
  }, {})

  return (
    <div className='flex items-center pt4 pb2 pr2 pl6'>
      <div className='flex-auto'>
        <div className='flex items-center'>
          <SquareAvatar className='flex-none' size={40} avatar={avatar} name={name} />
          <div className='flex-auto ml3' style={{lineHeight: 1.4}}>
            <div className='f-xl semibold gray10 truncate'>{name}</div>
            <div className='f-sm normal gray10 truncate'>Campaign's contacts</div>
          </div>
        </div>
      </div>
      <div className='flex-none'>
        {StatusValues.map((status, i) => (
          <div key={status} className={`inline-block px3 border-left ${i > 0 ? 'border-gray80' : 'border-transparent'}`}>
            <div className='gray20 normal center pb1' style={{fontSize: 20}}>{counts[status] || 0}</div>
            <div className='gray40 semibold f-xxs caps center'>{status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
