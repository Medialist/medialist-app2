import React, { PropTypes } from 'react'
import { Link, IndexLink } from 'react-router'
import NotificationsBell from './notifications-bell'
import UserInfo from './user-info'
import { Logo, MenuActivityIcon, MenuCampaignIcon, MenuContactIcon } from '../images/icons'

const linkStyle = { padding: '19px 25px 20px', display: 'inline-block' }

const NavBar = React.createClass({
  propTypes: {
    user: PropTypes.object,
    notifications: PropTypes.array
  },
  render () {
    const { notifications } = this.props
    return (
      <div className='navbar bg-gray10 clearfix' style={{height: 58}}>
        <nav className='inline-block align-top'>
          <IndexLink to='/' style={{ padding: '19px 28px 18px 26px', display: 'inline-block' }} className='white f5 semibold xs-hide align-top' >
            <Logo />
          </IndexLink>
          <IndexLink to='/' style={linkStyle} className='white f-sm regular opacity-30 hover-opacity-50 active-opacity-100' activeClassName='active bg-black'>
            <MenuActivityIcon style={{verticalAlign: 2}} />
            <span style={{marginLeft: 3}}>Activity</span>
          </IndexLink>
          <Link to='/campaigns' style={linkStyle} className='white f-sm regular opacity-30 hover-opacity-50 active-opacity-100' activeClassName='active bg-black'>
            <MenuCampaignIcon style={{verticalAlign: 2}} />
            <span style={{marginLeft: 3}}>Campaigns</span>
          </Link>
          <Link to='/contacts' style={linkStyle} className='white f-sm regular opacity-30 hover-opacity-50 active-opacity-100' activeClassName='active bg-black'>
            <MenuContactIcon style={{verticalAlign: 2}} />
            <span style={{marginLeft: 3}}>Contacts</span>
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
