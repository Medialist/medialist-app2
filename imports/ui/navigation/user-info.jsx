import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'

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
        <div className='inline-block hover-opacity-trigger' backgroundColor='transparent pointer' color='white' onClick={this.onNameClick}>
          <div className='inline-block'>
            <div className='f-xs semibold white'>{user.profile.name}</div>
            <div className='f-xxs semibold white opacity-40 hover-opacity-50'>{`Organisation name`}</div>
          </div>
          <div className='inline-block' style={{ verticalAlign: '5px', padding: '0 0 0 10px' }}>
            <Arrow direction='down' />
          </div>
        </div>
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
