import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { SquareAvatar } from '../images/avatar'

const Tag = (props) => {
  const {onClick, onRemove, style, children} = props
  return (
    <div
      className='inline-block bg-gray10 pointer rounded mr1 mb1 select-none'
      style={{height: 28, lineHeight: 1.5, ...style}}
      onClick={onClick}
      data-id='tag'
      data-tag={props.name}>
      {onRemove && (
        <div
          style={{fontWeight: 800, transform: 'scale(1.5)'}}
          className='inline-block px2 py1 gray40 f-xxs semibold'
          onClick={() => onRemove(props)}
          data-id='remove-tag-button'>
          &times;
        </div>
      )}
      {children}
    </div>
  )
}

Tag.propTypes = {
  onClick: PropTypes.func,
  onRemove: PropTypes.func,
  style: PropTypes.object,
  children: PropTypes.node
}

const CountTag = (props) => {
  return (
    <Tag {...props}>
      <div className='inline-block px2 py1 white semibold f-xxs border-gray20 border-left' data-id='tag-name'>{props.name}</div>
      {props.count !== undefined && <div className='inline-block pr2 pl0 py1 gray40 semibold f-xxs' data-id='tag-count'>{props.count}</div>}
    </Tag>
  )
}
export default CountTag

export const LinkedTag = (props) => {
  return (
    <Link to={props.to} data-id='tag-link'>
      <CountTag {...props} />
    </Link>
  )
}

export const AvatarTag = (props) => {
  const {avatar, name, ...tagProps} = props
  return (
    <Tag {...tagProps}>
      <SquareAvatar size={28} name={name} avatar={avatar} style={{borderRadius: 0}} />
      <div className='inline-block px2 py1 white f-xxs semibold'>{name}</div>
    </Tag>
  )
}
