import React, { PropTypes } from 'react'
import classNames from 'classnames/dedupe'

const Avatar = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string
  },

  getDefaultProps () {
    return { className: 'avatar' }
  },

  render () {
    const { avatar, name } = this.props
    const className = classNames(this.props.className, 'avatar')

    if (avatar) {
      return (
        <div className={className}><img src={avatar} alt={name} /></div>
      )
    }

    if (name) {
      const split = name.split(' ')
      let initials = split[0][0].toUpperCase()

      if (split.length > 1) {
        initials += split[split.length - 1][0].toUpperCase()
      }

      return (
        <div className={`${className} initials`}>{initials}</div>
      )
    }

    return <div className={className} />
  }
})

export default Avatar

export const CircleAvatar = (props) => {
  props.className = classNames(props.className, 'circle')
  return <Avatar {...props} />
}

export const SquareAvatar = (props) => {
  props.className = classNames(props.className, 'square')
  return <Avatar {...props} />
}
