import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { CircleAvatar, SquareAvatar, avatarStyle } from '/imports/ui/images/avatar'
import Tooltip from '/imports/ui/navigation/tooltip'
import { RemoveIcon } from '/imports/ui/images/icons'
import { Link } from 'react-router'

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
    maxAvatars: PropTypes.number,
    wrapper: PropTypes.func
  },

  getDefaultProps (props) {
    return {
      shape: 'circle',
      size: 30
    }
  },

  onClick (item) {
    if (this.props.onClick) {
      this.props.onClick(item)
    }
  },

  render () {
    const { items, size, shape, className, style, onRemove } = this.props
    const Avatar = shape === 'square' ? SquareAvatar : CircleAvatar
    const maxAvatars = this.props.maxAvatars || items.length
    let moreShape = shape
    const moreStyle = avatarStyle(size)

    if (shape === 'circle') {
      moreShape = 'pill'
      moreStyle.width = parseInt(moreStyle.width * 1.20, 10) + 'px'
      moreStyle.lineHeight = parseInt(parseInt(moreStyle.lineHeight, 10) * 0.85, 10) + 'px'
    }

    return (
      <ul className={classNames('list-reset center', className)} style={style}>
        {items.slice(0, maxAvatars).map((item, i) => {
          let avatar = <Avatar
            avatar={item.avatar}
            name={item.name}
            size={size}
            className={`border border-white ${onRemove ? 'hover-border-red' : ''}`}
            style={{ boxSizing: 'content-box', borderWidth: 2 }}
            onClick={() => this.onClick(item)} />

          if (this.props.wrapper) {
            avatar = <this.props.wrapper item={item}>{avatar}</this.props.wrapper>
          }

          return (
            <li key={item._id || i} className='inline-block mb1' onClick={() => onRemove ? onRemove(item, i) : ''}>
              <Tooltip title={item.name}>
                <span className={`relative inline-block hover-border-trigger hover-display-trigger hover-fill-trigger`}>
                  {avatar}
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
            <span className={`white bg-blue bold ${moreShape}`} style={moreStyle}>
              {`+${items.length - maxAvatars}`}
            </span>
          </Tooltip>
        )}
      </ul>
    )
  }
})

export default AvatarList

const ContactLink = ({item, ...props}) => (
  <Link to={`/contact/${item.slug}`} data-id='contact-link' {...props}>
    {props.children}
  </Link>
)

export const ContactAvatarList = (props) => {
  return <AvatarList wrapper={ContactLink} {...props} />
}
