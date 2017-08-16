import React from 'react'

export default function Loading (props) {
  let className = 'lolo'
  if (props.className) {
    className = className + ' ' + props.className
  }
  return <div className={className} />
}

export function LoadingBar () {
  return <div className='center p4'><Loading /></div>
}
