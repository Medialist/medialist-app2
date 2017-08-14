import React from 'react'

export default (props) => {
  let className = 'lolo'
  if (props.className) {
    className = className + ' ' + props.className
  }
  return <div className={className} />
}
