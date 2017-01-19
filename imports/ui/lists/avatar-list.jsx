import React, { PropTypes } from 'react'
import classNames from 'classnames'
import { CircleAvatar, SquareAvatar } from '../images/avatar'
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
    onRemove: PropTypes.func.isRequired,
    className: PropTypes.string,
    style: PropTypes.object
  },

  getDefaultProps () {
    return { shape: 'circle', size: 30 }
  },

  onAvatarClick (e, item, i) {
    e.preventDefault()
    this.props.onRemove(item, i)
  },

  render () {
    const { onAvatarClick } = this
    const { items, size, shape, className, style } = this.props
    const Avatar = shape === 'square' ? SquareAvatar : CircleAvatar

    return (
      <ul className={classNames('list-reset center', className)} style={style}>
        {items.map((item, i) => {
          const { avatar, name } = item
          return (
            <li key={item._id || i} className='inline-block mb1' onClick={(e) => onAvatarClick(e, item, i)}>
              <Tooltip title={name}>
                <span
                  className='circle relative inline-block border border-transparent hover-border-red hover-display-trigger hover-fill-trigger'
                  style={{
                    width: size + 4,
                    height: size + 4,
                    borderWidth: 2
                  }}>
                  <Avatar avatar={avatar} name={name} size={size} />
                  <RemoveIcon
                    className='absolute hover-display-block'
                    style={{
                      color: 'red',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: 'none'
                    }} />
                </span>
              </Tooltip>
            </li>
          )
        })}
      </ul>
    )
  }
})

export default AvatarList
