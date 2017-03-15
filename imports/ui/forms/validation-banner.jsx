import React from 'react'
import { Close } from '../images/icons'

export default ({show, error, onDismiss}) => {
  if (!show || !error) return null
  return (
    <div
      className='shadow-2 absolute top-0 left-0 right-0 px4 bg-yellow-lighter f-xs gray10 semibold flex items-center'
      style={{zIndex: 4, paddingTop: 17, paddingBottom: 17}}>
      <div className='flex-auto'>{error}</div>
      <Close className='flex-none pointer' onClick={onDismiss} />
    </div>
  )
}
