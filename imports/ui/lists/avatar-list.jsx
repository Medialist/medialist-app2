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

  render () {
    const { items, size, shape, className, style, onRemove } = this.props
    const Avatar = shape === 'square' ? SquareAvatar : CircleAvatar

    return (
      <ul className={classNames('list-reset center', className)} style={style}>
        {items.map((item, i) => {
          const { avatar, name } = item
          return (
            <li key={item._id || i} className='inline-block mb1' onClick={() => onRemove(item, i)}>
              <Tooltip title={name}>
                <span className='relative inline-block hover-border-trigger hover-display-trigger hover-fill-trigger'>
                  <Avatar
                    avatar={avatar}
                    name={name}
                    size={size}
                    className='border border-white hover-border-red'
                    style={{ boxSizing: 'content-box', borderWidth: 2 }} />
                  <RemoveIcon
                    className='absolute display-none hover-display-block'
                    style={{
                      color: 'red',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
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
