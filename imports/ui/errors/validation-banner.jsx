import React from 'react'

export default ({ show, error }) => {
  if (!show || !error) return null
  return (
    <div
      className='shadow-2 absolute top-0 left-0 right-0 px4 bg-yellow-lighter f-xs gray10 semibold'
      style={{zIndex: 1, paddingTop: 16, paddingBottom: 17}}>
      {error}
    </div>
  )
}
