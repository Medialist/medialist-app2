import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Arrow from 'rebass/dist/Arrow'
import { Dropdown, DropdownMenu } from '/imports/ui/lists/dropdown'
import { CircleAvatar } from '/imports/ui/images/avatar'
import { SettingsIcon, ExitIcon, HamburgerIcon, QuestionMark } from '/imports/ui/images/icons'
import { dropdownMenuStyle } from '/imports/ui/common-styles'

const dropdownStyle = Object.assign({}, dropdownMenuStyle, { width: 223, top: 'calc(100% - 2px)', right: '-5px' })

class UserInfo extends React.PureComponent {
  static propTypes = {
    name: PropTypes.string
  }

  state = {
    isDropdownOpen: false
  }

  onNameClick = () => {
    this.setState({ isDropdownOpen: true })
  }

  onLinkClick = () => {
    this.setState({ isDropdownOpen: false })
  }

  onDropdownDismiss = () => {
    this.setState({ isDropdownOpen: false })
  }

  render () {
    const { name, email, avatar } = this.props
    return (
      <Dropdown style={{padding: '14px 0 13px 25px', marginRight: 18}}>
        <div className='inline-block hover-opacity-trigger pointer' onClick={this.onNameClick} data-id='user-info-menu'>
          <HamburgerIcon className='flex-none md-hide lg-hide' />
          <CircleAvatar name={name} avatar={avatar} style={{ verticalAlign: '-2px', marginRight: '10px' }} className='xs-hide sm-hide' />
          <div className='inline-block xs-hide sm-hide'>
            <div className='f-xs semibold white'>{name}</div>
            <div className='f-xxs semibold white opacity-40 hover-opacity-50' style={{marginTop: 2}}>{email}</div>
          </div>
          <div className='inline-block xs-hide sm-hide' style={{ verticalAlign: '5px', padding: '0 12px 0 20px' }}>
            <Arrow direction='down' />
          </div>
        </div>
        <DropdownMenu right arrowPosition='calc(100% - 24px)' style={dropdownStyle} open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
          <div className='px4 py3 md-hide lg-hide' style={{width: 225}}>
            <CircleAvatar name={name} avatar={avatar} />
            <div className='inline-block align-middle pl2'>
              <div className='f-md semibold gray10'>{name}</div>
              <div className='f-xs normal gray20'>{email}</div>
            </div>
          </div>
          <nav className='block border-top border-gray80' style={{width: 225}}>
            <Link to='/settings' className='block px3 py2 f-md normal gray20 hover-bg-gray90 hover-box-shadow-x-gray80' activeClassName='active' onClick={this.onLinkClick} data-id='settings-link'>
              <SettingsIcon className='gray60' />
              <span className='ml2'>Settings</span>
            </Link>
            <a href='http://docs.medialist.io/' className='block px3 py2 f-md normal gray20 hover-bg-gray90 hover-box-shadow-x-gray80' target='_blank'>
              <QuestionMark className='gray60' />
              <span className='ml2'>Help Center</span>
            </a>
            <Link to='/logout' className='block px3 py2 f-md normal gray20 hover-bg-gray90 hover-box-shadow-x-gray80' activeClassName='active' data-id='logout-link'>
              <ExitIcon className='gray60' />
              <span className='ml2'>Logout</span>
            </Link>
          </nav>
        </DropdownMenu>
      </Dropdown>
    )
  }
}

export default UserInfo
