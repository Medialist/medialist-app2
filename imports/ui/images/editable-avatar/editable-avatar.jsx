import React, { PropTypes } from 'react'
import classNames from 'classnames/dedupe'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import { dropdownMenuStyle } from '../../common-styles'
import Menu from './menu'

const EditableAvatar = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
  },

  getInitialState () {
    return { isDropdownOpen: false }
  },

  onAvatarClick (e) {
    // Don't open dropdown if click target is the menu or descendant of
    let parent = e.target

    while (parent) {
      if (parent.className === 'DropdownMenu') return
      parent = parent.parentElement
    }

    this.setState({ isDropdownOpen: true })
  },

  onDropdownDismiss () {
    this.setState({ isDropdownOpen: false })
  },

  onImageChange (e) {
    this.setState({ isDropdownOpen: false })
    this.props.onChange(e)
  },

  onImageError (err) {
    this.setState({ isDropdownOpen: false })
    this.props.onError(err)
  },

  render () {
    const { avatar, children, style } = this.props
    const { isDropdownOpen } = this.state
    const className = classNames(
      'relative inline-block',
      { 'hover-opacity-50 hover-cursor-pointer': !isDropdownOpen },
      this.props.className
    )
    const { onImageChange, onImageError, onAvatarClick, onDropdownDismiss } = this

    return (
      <div className={className} style={style} onClick={onAvatarClick}>
        {children}
        <DropdownMenu
          style={{ ...dropdownMenuStyle, width: 250 }}
          open={isDropdownOpen}
          onDismiss={onDropdownDismiss}>
          <Menu avatar={avatar} onChange={onImageChange} onError={onImageError} />
        </DropdownMenu>
      </div>
    )
  }
})

export default EditableAvatar
