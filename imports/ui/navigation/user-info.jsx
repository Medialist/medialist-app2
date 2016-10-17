import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import Button from 'rebass/dist/Button'

const UserInfo = React.createClass({
  propTypes: {
    user: PropTypes.object
  },

  getInitialState () {
    return { isDropdownOpen: false }
  },

  onNameClick () {
    this.setState({ isDropdownOpen: true })
  },

  onLinkClick () {
    this.setState({ isDropdownOpen: false })
  },

  onDropdownDismiss () {
    this.setState({ isDropdownOpen: false })
  },

  render () {
    const { user } = this.props

    return (
      <Dropdown>
        <Button backgroundColor='transparent' color='black' onClick={this.onNameClick}>{user.profile.name}</Button>
        <DropdownMenu open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
          <div>
            {user.profile.name}
            <hr />
          </div>
          <ul>
            <li>
              <Link to='/settings' activeClassName='active' onClick={this.onLinkClick}>Settings</Link>
            </li>
            <li>
              <Link to='/logout' activeClassName='active' onClick={this.onLinkClick}>Logout</Link>
            </li>
          </ul>
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default UserInfo
