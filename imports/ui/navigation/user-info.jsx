import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import { Dropdown, DropdownMenu } from '../lists/dropdown'
import { CircleAvatar } from '../images/avatar.jsx'
import { SettingsIcon, ExitIcon, HamburgerIcon } from '../images/icons'
import { dropdownMenuStyle } from '../common-styles'

const dropdownStyle = Object.assign({}, dropdownMenuStyle, { width: 223, top: 'calc(100% - 2px)', right: '-5px' })

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
      <Dropdown style={{padding: '14px 0 13px 25px', marginRight: 18}}>
        <div className='inline-block hover-opacity-trigger pointer' onClick={this.onNameClick}>
          <HamburgerIcon className='flex-none md-hide lg-hide' />
          <CircleAvatar name={user.profile.name} avatar={user.profile.avatar} style={{ verticalAlign: '-2px', marginRight: '10px' }} className='xs-hide sm-hide' />
          <div className='inline-block xs-hide sm-hide'>
            <div className='f-xs semibold white'>{user.profile.name}</div>
            <div className='f-xxs semibold white opacity-40 hover-opacity-50' style={{marginTop: 2}}>{user.emails[0].address}</div>
          </div>
          <div className='inline-block xs-hide sm-hide' style={{ verticalAlign: '5px', padding: '0 12px 0 20px' }}>
            <Arrow direction='down' />
          </div>
        </div>
        <DropdownMenu right arrowPosition='calc(100% - 24px)' style={dropdownStyle} open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
          <div className='px4 py3 md-hide lg-hide' style={{width: 225}}>
            <CircleAvatar name={user.profile.name} avatar={user.profile.avatar} />
            <div className='inline-block align-middle pl2'>
              <div className='f-md semibold gray10'>{user.profile.name}</div>
              <div className='f-xs normal gray20'>{user.emails[0].address}</div>
            </div>
          </div>
          <nav className='block border-top border-gray80 py1' style={{width: 225}}>
            <Link to='/settings' className='block px3 py2 f-md normal gray20 hover-bg-blue' activeClassName='active' onClick={this.onLinkClick}>
              <SettingsIcon />
              <span className='ml2'>Settings</span>
            </Link>
            <Link to='/logout' className='block px3 py2 f-md normal gray20 hover-bg-blue' activeClassName='active'>
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
