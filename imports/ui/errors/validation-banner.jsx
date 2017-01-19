import React from 'react'

export default ({ error }) => {
  if (!error) return null
  return <div className='absolute top-0 left-0 right-0 bg-yellow-lighter p2 bold' style={{zIndex: 1}}>Oops. {error}</div>
}
