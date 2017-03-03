import React, { PropTypes } from 'react'
import classNames from 'classnames'
import { Dropdown, DropdownMenu } from '../../navigation/dropdown'
import Menu from './menu'

const EditableAvatar = React.createClass({
  propTypes: {
    avatar: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    menuLeft: PropTypes.number,
    menuTop: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired
  },

  getInitialState () {
    return { isDropdownOpen: false }
  },

  onAvatarClick (e) {
    this.setState((s) => ({ isDropdownOpen: !s.isDropdownOpen }))
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
    const { avatar, children, style, menuLeft, menuTop } = this.props
    const { isDropdownOpen } = this.state
    const className = classNames(
      'relative inline-block',
      { 'hover-opacity-50 hover-cursor-pointer': !isDropdownOpen },
      this.props.className
    )
    const { onImageChange, onImageError, onAvatarClick, onDropdownDismiss } = this
    return (
      <Dropdown>
        <div className={className} style={style} onClick={onAvatarClick}>
          {children}
        </div>
        <DropdownMenu
          width={250}
          left={menuLeft}
          top={menuTop}
          open={isDropdownOpen}
          onDismiss={onDropdownDismiss}>
          <Menu avatar={avatar} onChange={onImageChange} onError={onImageError} />
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default EditableAvatar
