import React from 'react'

export default ({ currentUser, user }) => {
  let name
  if (currentUser) {
    name = currentUser._id === user._id ? 'You' : user.name
  } else {
    name = user.name
  }
  return <span>{name || 'Unknown'}</span>
}
