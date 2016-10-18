import React, { PropTypes } from 'react'
import classNames from 'classnames/dedupe'

const Avatar = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object
  },

  render () {
    const { avatar, name } = this.props
    const className = classNames(this.props.className, 'inline-block circle overflow-hidden bg-black white f-md normal align-middle center')
    const style = Object.assign({ width: 40, height: 40, lineHeight: '40px' }, this.props.style || {})

    if (avatar) {
      return (
        <div className={className} style={style}>
          <img style={{width: '100%', height: '100%'}} src={avatar} alt={name} />
        </div>
      )
    }

    if (name) {
      const split = name.split(' ')
      let initials = split[0][0].toUpperCase()

      if (split.length > 1) {
        initials += split[split.length - 1][0].toUpperCase()
      }

      return (
        <div style={style} className={`${className} initials`}>{initials}</div>
      )
    }

    return <div style={style} className={className} />
  }
})

export default Avatar

export const CircleAvatar = (props) => {
  props.className = classNames(props.className, 'circle')
  return <Avatar {...props} />
}

export const SquareAvatar = (props) => {
  props.className = classNames(props.className, 'rounded')
  return <Avatar {...props} />
}
