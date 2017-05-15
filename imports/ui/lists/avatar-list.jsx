import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CircleAvatar, SquareAvatar, avatarStyle } from '../images/avatar'
import Tooltip from '../navigation/tooltip'
import { RemoveIcon } from '../images/icons'

const AvatarList = React.createClass({
  propTypes: {
    items: PropTypes.arrayOf(PropTypes.shape({
      avatar: PropTypes.string,
      name: PropTypes.string
    })).isRequired,
    size: PropTypes.number,
    shape: PropTypes.oneOf(['circle', 'square']),
    onRemove: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.object,
    maxAvatars: PropTypes.number
  },

  getDefaultProps (props) {
    return {
      shape: 'circle',
      size: 30
    }
  },

  render () {
    const { items, size, shape, className, style, onRemove } = this.props
    const Avatar = shape === 'square' ? SquareAvatar : CircleAvatar
    const maxAvatars = this.props.maxAvatars || items.length

    return (
      <ul className={classNames('list-reset center', className)} style={style}>
        {items.slice(0, maxAvatars).map((item, i) => {
          const { avatar, name } = item
          return (
            <li key={item._id || i} className='inline-block mb1' onClick={() => onRemove ? onRemove(item, i) : ''}>
              <Tooltip title={name}>
                <span className={`relative inline-block hover-border-trigger hover-display-trigger hover-fill-trigger`}>
                  <Avatar
                    avatar={avatar}
                    name={name}
                    size={size}
                    className={`border border-white ${onRemove ? 'hover-border-red' : ''}`}
                    style={{ boxSizing: 'content-box', borderWidth: 2 }} />
                  {onRemove && <RemoveIcon
                    className='absolute display-none hover-display-block'
                    style={{
                      width: `${Math.round(size * 0.66)}px`,
                      height: `${Math.round(size * 0.66)}px`,
                      color: 'red',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }} />}
                </span>
              </Tooltip>
            </li>
          )
        })}
        {items.length > maxAvatars && (
          <Tooltip title={`${items.length - maxAvatars} more`}>
            <span className={`white bg-gray60 round bold ${shape}`} style={avatarStyle(size)}>
              {`+${items.length - maxAvatars}`}
            </span>
          </Tooltip>
        )}
      </ul>
    )
  }
})

export default AvatarList
