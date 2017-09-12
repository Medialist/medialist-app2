import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames/dedupe'
import { CameraIcon } from '/imports/ui/images/icons'
import Tooltip from '/imports/ui/navigation/tooltip'

const defaultSize = 30

class Avatar extends React.Component {
  static propTypes: {
    avatar: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    size: PropTypes.number
  }

  state = {
    imageLoadError: false
  }

  componentWillReceiveProps ({ avatar }) {
    if (avatar !== this.props.avatar) this.setState({ imageLoadError: false })
  }

  onError = () => {
    this.setState({ imageLoadError: true })
  }

  resizeAvatar (url, size) {
    if (url.indexOf('ucarecdn') === -1) return url
    return `${url}-/scale_crop/${size}x${size}/center/`
  }

  render () {
    const { imageLoadError } = this.state
    const { avatar, name, email, size = defaultSize, showTooltip = false } = this.props
    const className = classNames(this.props.className, 'white semibold')
    const style = avatarStyle(size, this.props.style)

    let title = email

    if (name) {
      title = name
    }

    let element

    if (avatar && !imageLoadError) {
      const src = this.resizeAvatar(avatar, size * 2) // @2x for hdpi

      element = (
        <div className={className} style={style}>
          <img style={{width: '100%', height: '100%'}} src={src} alt={title} onError={this.onError} />
        </div>
      )
    } else if (title) {
      const initials = title
        .split(' ')
        .filter((n) => !!n)
        .map((n) => n[0].toUpperCase())
        .join('')

      element = (
        <div style={style} className={classNames(className, 'initials')}>{initials}</div>
      )
    } else {
      style.lineHeight = `${this.props.size - 8}px`

      element = (
        <div style={style} className={className}>
          <CameraIcon className='svg-icon-xl' style={{width: `${size - 10}px`, height: `${size - 10}px`, lineHeight: `${size - 5}px`}} />
        </div>
      )
    }

    if (!showTooltip) {
      return element
    }

    return (
      <Tooltip title={title}>
        {element}
      </Tooltip>
    )
  }
}

export default Avatar

export const CircleAvatar = (props) => {
  const className = classNames(props.className, 'circle bg-gray60')
  return <Avatar {...props} className={className} />
}

export const SquareAvatar = (props) => {
  const className = classNames(props.className, 'rounded bg-black')
  return <Avatar {...props} className={className} />
}

export const avatarStyle = (size, style = {}) => {
  const fontSize = Math.max((size / defaultSize) * 13, 13).toFixed(0) + 'px'
  return Object.assign({
    fontSize,
    lineHeight: size + 'px',
    width: size,
    height: size,
    display: 'inline-block',
    overflow: 'hidden',
    textAlign: 'center',
    verticalAlign: 'middle'
  }, style)
}
