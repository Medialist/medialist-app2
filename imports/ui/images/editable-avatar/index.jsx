import React, { PropTypes } from 'react'
import classNames from 'classnames/dedupe'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import { dropdownMenuStyle } from '../common-styles'
import Avatar from '../avatar'
import EditableAvatarMenu from './menu'

const EditableAvatar = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    name: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired
  },

  getInitialState () {
    return { isDropdownOpen: false }
  },

  onAvatarClick () {
    this.setState({ isDropdownOpen: true })
  },

  onDropdownDismiss () {
    this.setState({ isDropdownOpen: false })
  },

  onImageChange (url) {
    this.setState({ isDropdownOpen: false })
    this.props.onChange(url)
  },

  render () {
    const { avatar, name, style, onDropdownDismiss } = this.props
    const className = classNames(this.props.className, 'hover-opacity-50')
    const { isDropdownOpen } = this.state
    const { onImageChange, onAvatarClick } = this

    return (
      <Dropdown>
        <Avatar
          avatar={avatar}
          name={name}
          style={style}
          className={className}
          onClick={onAvatarClick} />
        <DropdownMenu
          style={dropdownMenuStyle}
          open={isDropdownOpen}
          onDismiss={onDropdownDismiss}>
          <EditableAvatarMenu avatar={avatar} onChange={onImageChange} />
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default EditableAvatar

export const EditableCircleAvatar = (props) => {
  const className = classNames(props.className, 'circle bg-gray60')
  return <EditableAvatar {...props} className={className} />
}

export const EditableSquareAvatar = (props) => {
  const className = classNames(props.className, 'rounded bg-black')
  return <EditableAvatar {...props} className={className} />
}
