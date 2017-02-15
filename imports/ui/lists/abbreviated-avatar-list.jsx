import React, { PropTypes } from 'react'
import classNames from 'classnames'
import { CircleAvatar, SquareAvatar } from '../images/avatar'
import Tooltip from '../navigation/tooltip'

const defaultSize = 30

const AbbreviatedAvatarList = React.createClass({
  propTypes: {
    items: PropTypes.arrayOf(PropTypes.shape({
      avatar: PropTypes.string,
      name: PropTypes.string
    })).isRequired,
    size: PropTypes.number,
    maxAvatars: PropTypes.number,
    maxTooltip: PropTypes.number,
    total: PropTypes.number, // total can be supplied to avoid having to supply a full list of items to only render a few
    shape: PropTypes.oneOf(['circle', 'square']),
    className: PropTypes.string,
    style: PropTypes.object
  },

  getDefaultProps () {
    return { shape: 'circle', size: defaultSize, maxAvatars: 8, maxTooltip: 24 }
  },

  renderTooltip ({ tooltipExcess, tooltipItems }) {
    return (
      <ul className='list-reset m0 left-align p1 f-xs semibold' style={{ minWidth: '150px', lineHeight: 1.35 }}>
        {tooltipItems.map((item) => <li>{item.name}</li>)}
        {tooltipExcess ? <li>and {tooltipExcess} more...</li> : null}
      </ul>
    )
  },

  renderExcess ({ avatarExcess, tooltipExcess, tooltipItems }) {
    const { size, shape } = this.props
    const className = 'inline-block overflow-hidden bg-blue border border-white semibold align-middle center'
    const fontSize = ((size / defaultSize) * 13).toFixed(0) + 'px'
    const style = { minWidth: size * 1.3, height: size, lineHeight: size + 'px', fontSize, boxSizing: 'content-box', borderWidth: 2 }
    if (shape === 'circle') style.borderRadius = '99999px'

    return (
      <li className='inline-block mb1' style={{ marginLeft: '2px' }}>
        <Tooltip position='bottom' title={this.renderTooltip({ tooltipExcess, tooltipItems })}>
          <span className='relative inline-block'>
            <div className={className} style={style}>
              <div className='white px2'>+{avatarExcess}</div>
            </div>
          </span>
        </Tooltip>
      </li>
    )
  },

  render () {
    const { items, size, maxAvatars, maxTooltip, total, shape, className, style } = this.props
    const itemCount = total || items.length
    const avatarExcess = Math.max(0, itemCount - maxAvatars)
    const tooltipExcess = Math.max(0, itemCount - maxAvatars - maxTooltip)
    const Avatar = shape === 'square' ? SquareAvatar : CircleAvatar

    return (
      <ul className={classNames('list-reset center mb0', className)} style={style}>
        {items.slice(0, maxAvatars).map((item, i) => {
          const { avatar, name } = item
          return (
            <li key={item._id || i} className='inline-block f-xs semibold' style={{ marginLeft: i ? '2px' : 0 }}>
              <Tooltip title={name}>
                <span className='relative inline-block'>
                  <Avatar
                    avatar={avatar}
                    name={name}
                    size={size}
                    className='border border-white'
                    style={{ boxSizing: 'content-box', borderWidth: 2 }} />
                </span>
              </Tooltip>
            </li>
          )
        })}
        {avatarExcess
          ? this.renderExcess({
            avatarExcess,
            tooltipExcess,
            tooltipItems: items.slice(maxAvatars, maxAvatars + maxTooltip)
          })
          : null}
      </ul>
    )
  }
})

export default AbbreviatedAvatarList
