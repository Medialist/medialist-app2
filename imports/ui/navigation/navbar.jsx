import React, { PropTypes } from 'react'
import { Link, IndexLink } from 'react-router'
import NotificationsBell from './notifications-bell'
import UserInfo from './user-info'
import { Logo, MenuActivityIcon, MenuCampaignIcon, MenuContactIcon } from '../images/icons'

const linkStyle = { padding: '19px 25px 18px', display: 'inline-block', verticalAlign: 'top' }

const NavBar = React.createClass({
  propTypes: {
    user: PropTypes.object,
    notifications: PropTypes.array
  },
  render () {
    const { user, notifications } = this.props
    return (
      <div className='navbar bg-gray10 clearfix' style={{height: 58}}>
        <nav className='inline-block left'>
          <IndexLink to='/' style={{ padding: '18px 25px 16px', display: 'inline-block', verticalAlign: 'top' }} className='white f5 semibold xs-hide' >
            <Logo />
          </IndexLink>
          <IndexLink to='/' style={linkStyle} className='white f5 semibold opacity-30 hover-opacity-50 active-opacity-100' activeClassName='active bg-black'>
            <MenuActivityIcon /> Activity
          </IndexLink>
          <Link to='/campaigns' style={linkStyle} className='white f5 semibold opacity-30 hover-opacity-50 active-opacity-100' activeClassName='active bg-black'>
            <MenuCampaignIcon /> Campaigns
          </Link>
          <Link to='/contacts' style={linkStyle} className='white f5 semibold opacity-30 hover-opacity-50 active-opacity-100' activeClassName='active bg-black'>
            <MenuContactIcon /> Contacts
          </Link>
        </nav>
        <div className='inline-block right xs-hide'>
          <UserInfo user={this.props.user} />
        </div>
        <div className='inline-block right' style={{padding: '9px 0'}}>
          <NotificationsBell notifications={notifications} />
        </div>
      </div>
    )
  }
})

export default NavBar
