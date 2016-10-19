import React from 'react'

export default ({ currentUser, user }) => {
  const name = currentUser._id === user._id ? 'You' : user.name
  return <span className='semibold'>{name || 'Unknown'}</span>
}
