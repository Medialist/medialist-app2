import React, { PropTypes } from 'react'
import classNames from 'classnames/dedupe'

const defaultSize = 40

const Avatar = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    size: PropTypes.number
  },

  getInitialState () {
    return { imageLoadError: false }
  },

  onError () {
    this.setState({ imageLoadError: true })
  },

  render () {
    const { imageLoadError } = this.state
    const { avatar, name } = this.props
    const className = classNames(this.props.className, 'inline-block overflow-hidden white normal align-middle center')
    const size = Number(this.props.size || defaultSize) // px
    const fontSize = ((size / defaultSize) * 100) + '%' // a size of 40px gives a fontSize of 100% which matches the body fontSize.
    const style = Object.assign({ width: size, height: size, lineHeight: size + 'px', fontSize }, this.props.style || {})

    if (avatar && !imageLoadError) {
      return (
        <div className={className} style={style}>
          <img style={{width: '100%', height: '100%'}} src={avatar} alt={name} title={name} onError={this.onError} />
        </div>
      )
    }

    if (name) {
      const initials = name
        .split(' ')
        .filter((n) => !!n)
        .map((n) => n[0].toUpperCase())
        .join('')

      return (
        <div style={style} className={classNames(className, 'initials')} title={name}>{initials}</div>
      )
    }

    return <div style={style} className={className} />
  }
})

export default Avatar

export const CircleAvatar = (props) => {
  const className = classNames(props.className, 'circle bg-gray60')
  return <Avatar {...props} className={className} />
}

export const SquareAvatar = (props) => {
  const className = classNames(props.className, 'rounded bg-black')
  return <Avatar {...props} className={className} />
}
