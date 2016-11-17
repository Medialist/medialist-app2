import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import { CircleAvatar } from '../images/avatar.jsx'
import { SettingsIcon, ExitIcon } from '../images/icons'
import { dropdownMenu } from '../common-styles'

const dropdownStyle = Object.assign({}, dropdownMenu, { width: 223 })

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
      <Dropdown style={{padding: '14px 15px 13px 25px', marginRight: 16}}>
        <div className='inline-block hover-opacity-trigger pointer' onClick={this.onNameClick}>
          <div className='inline-block'>
            <div className='f-xs regular white'>{user.profile.name}</div>
            <div className='f-xxs regular white opacity-40 hover-opacity-50' style={{marginTop: 2}}>{`Organisation name`}</div>
          </div>
          <div className='inline-block' style={{ verticalAlign: '5px', padding: '0 0 0 10px' }}>
            <Arrow direction='down' />
          </div>
        </div>
        <DropdownMenu right style={dropdownStyle} open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
          <div className='px4 py3'>
            <CircleAvatar name={user.profile.name} />
            <div className='inline-block align-middle pl2'>
              <div className='f-md semibold gray10'>{user.profile.name}</div>
              <div className='f-xs normal gray20'>{`Organisation name`}</div>
            </div>
          </div>
          <nav className='block border-top border-gray80 py1'>
            <Link to='/settings' className='block px3 py2 f-md normal gray20 hover-bg-blue' activeClassName='active' onClick={this.onLinkClick}>
              <SettingsIcon />
              <span className='ml2'>Settings</span>
            </Link>
            <Link to='/logout' className='block px3 py2 f-md normal gray20 hover-bg-blue' activeClassName='active' onClick={this.onLinkClick}>
              <ExitIcon />
              <span className='ml2'>Logout</span>
            </Link>
          </nav>
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default UserInfo
