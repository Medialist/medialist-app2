import React, { PropTypes } from 'react'
import { SquareAvatar } from '../images/avatar'

const Tag = (props) => {
  const {onClick, onRemove, style, children} = props
  return (
    <div
      className='inline-block bg-gray10 pointer rounded mr1 mb1'
      style={{padding: 1, lineHeight: 1.5, ...style}}
      onClick={onClick}>
      <div
        className='inline-block px2 py1 gray40 f-xxs bold'
        onClick={() => onRemove(props)}>
        &times;
      </div>
      {children}
    </div>
  )
}

Tag.propTypes = {
  onClick: PropTypes.func,
  onRemove: PropTypes.func.isRequired,
  style: PropTypes.object,
  children: PropTypes.node
}

const CountTag = (props) => {
  const {count, name, ...tagProps} = props
  return (
    <Tag {...tagProps}>
      <div className='inline-block px2 py1 white f-xxs border-gray20 border-left'>{name}</div>
      <div className='inline-block pr2 pl0 py1 gray40 f-xxs'>{count}</div>
    </Tag>
  )
}
export default CountTag

export const AvatarTag = (props) => {
  const {avatar, name, ...tagProps} = props
  return (
    <Tag {...tagProps}>
      <SquareAvatar size={28} name={name} avatar={avatar} />
      <div className='inline-block px2 py1 white f-xxs'>{name}</div>
    </Tag>
  )
}
