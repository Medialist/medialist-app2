import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import Button from 'rebass/dist/Button'
import { NotificationBell } from '../images/icons'

const NotificationsBell = React.createClass({
  propTypes: {
    notifications: PropTypes.array
  },

  getInitialState () {
    return { isDropdownOpen: false }
  },

  onBellClick () {
    this.setState({ isDropdownOpen: true })
  },

  onDropdownDismiss () {
    this.setState({ isDropdownOpen: false })
  },

  onSeeAllClick () {
    this.setState({ isDropdownOpen: false })
  },

  onMarkAllReadClick () {
    console.log('TODO: Mark all read')
  },

  render () {
    return (
      <Dropdown>
        <Button backgroundColor='transparent' onClick={this.onBellClick}><NotificationBell /></Button>
        <DropdownMenu open={this.state.isDropdownOpen} onDismiss={this.onDropdownDismiss}>
          <div>
            <div>2 unread notifications</div>
            <Button backgroundColor='transparent' color='black' onClick={this.onMarkAllReadClick}>Mark all as read</Button>
          </div>
          <ul>
            <li className='unread'>
              <b>Peter Jackson</b> logged coverage for <b>Amazon UK Seller Stories</b>
              <time dateTime='2016-10-17T19:00'>Just Now</time>
            </li>
            <li>
              <b>Mike Douglas</b> logged feedback for <b>Sketch 4</b>
              <time dateTime='2016-10-17T18:55'>5 minutes ago</time>
            </li>
          </ul>
          <Link to='/notifications' activeClassName='active' onClick={this.onSeeAllClick}>See all</Link>
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default NotificationsBell
