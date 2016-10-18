import React, { PropTypes } from 'react'
import { Link, IndexLink } from 'react-router'
import NotificationsBell from './notifications-bell'
import UserInfo from './user-info'

const linkStyle = { height: 62, padding: '20px 25px', color: 'white', display: 'inline-block' }

const NavBar = React.createClass({
  propTypes: {
    user: PropTypes.object,
    notifications: PropTypes.array
  },
  render () {
    return (
      <div className='navbar bg-gray10 clearfix'>
        <nav className='inline-block left'>
          <IndexLink to='/' style={linkStyle} className='navbar-link white transition xs-hide'>ML</IndexLink>
          <IndexLink to='/' style={linkStyle} className='navbar-link white transition' activeClassName='active bg-black'>Activity</IndexLink>
          <Link to='/campaigns' style={linkStyle} className='navbar-link white transition' activeClassName='active bg-black'>Campaigns</Link>
          <Link to='/contacts' style={linkStyle} className='navbar-link white transition' activeClassName='active bg-black'>Contacts</Link>
        </nav>
        <div className='inline-block right xs-hide' style={{padding: '14px 25px 14px 0'}}>
          <UserInfo user={this.props.user} />
        </div>
        <div className='inline-block right' style={{padding: '14px 0'}}>
          <NotificationsBell notifications={this.props.notifications} />
        </div>
      </div>
    )
  }
})

export default NavBar
