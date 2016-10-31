import React from 'react'

export default (props) => (
  <div className='inline-block bg-gray10 pointer rounded mr1 mb1' style={{padding: 1, lineHeight: 1.5}} onClick={props.onClick}>
    <div className='inline-block px2 py1 gray40 f-xxs border-gray20 border-right'>&times;</div>
    <div className='inline-block px2 py1 white f-xxs'>{props.name}</div>
    <div className='inline-block pr2 pl0 py1 gray40 f-xxs'>{props.count}</div>
  </div>
)
