import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import NotificationsBell from './notifications-bell'
import UserInfo from './user-info'

const NavBar = React.createClass({
  propTypes: {
    user: PropTypes.object,
    notifications: PropTypes.array
  },

  render () {
    return (
      <div>
        <ul>
          <li><Link to='/' activeClassName='active'>Activity</Link></li>
          <li><Link to='/campaigns' activeClassName='active'>Campaigns</Link></li>
          <li><Link to='/contacts' activeClassName='active'>Contacts</Link></li>
        </ul>
        <div>
          <NotificationsBell notifications={this.props.notifications} />
          <UserInfo user={this.props.user} />
        </div>
      </div>
    )
  }
})

export default NavBar
