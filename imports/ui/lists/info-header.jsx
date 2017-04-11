import React from 'react'

const InfoHeader = (props) => (
  <div className='clearfix p2 pt4 mt4 border-gray80 border-bottom'>
    <span className='pointer f-xs blue right' onClick={props.onClick} data-id={props['data-id']}>{props.linkText || 'Edit'}</span>
    <h1 className='m0 f-md normal gray20 left'>{props.name}</h1>
  </div>
)

export default InfoHeader
