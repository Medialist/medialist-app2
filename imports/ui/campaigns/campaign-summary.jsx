import React from 'react'
import { SquareAvatar } from '../images/avatar'

export default (props) => {
  const { contacts, name, avatar } = props.campaign
  const statuses = Object.values(contacts || [])

  // { 'Completed': 10, 'Hot Lead': 3, etc}
  const counts = statuses.reduce((counts, s) => {
    if (!counts[s]) counts[s] = 0
    counts[s] = counts[s] + 1
    return counts
  }, {})

  return (
    <div className='pt4 pb2 pr2 pl6 clearfix'>
      <div className='inline-block right'>
        {Object.values(window.Contacts.status).map((status, i) => (
          <div className={`inline-block px3 border-left ${i > 0 ? 'border-gray80' : 'border-transparent'}`}>
            <div className='gray20 normal center pb1' style={{fontSize: 20}}>{counts[status] || 0}</div>
            <div className='gray40 semibold f-xxs caps center'>{status}</div>
          </div>
        ))}
      </div>
      <SquareAvatar avatar={avatar} name={name} />
      <div className='inline-block align-middle ml3' style={{lineHeight: 1.4}}>
        <div className='f-xl semibold gray10'>{name}</div>
        <div className='f-sm normal gray10'>Campaign's contacts</div>
      </div>
    </div>
  )
}
