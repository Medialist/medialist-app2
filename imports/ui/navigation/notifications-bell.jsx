import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from 'rebass/dist/DropdownMenu'
import Button from 'rebass/dist/Button'
import { NotificationBell, ChevronRight } from '../images/icons'
import { Notifications, NotificationSummary } from '../users/notification'

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
    const { onBellClick, onDropdownDismiss, onMarkAllReadClick } = this
    const { isDropdownOpen } = this.state
    const { notifications } = this.props
    const style = { width: '480px' }

    return (
      <Dropdown>
        <Button backgroundColor='transparent' onClick={onBellClick}><NotificationBell /></Button>
        <DropdownMenu open={isDropdownOpen} onDismiss={onDropdownDismiss} right>
          <div style={style}>
            <NotificationSummary notifications={notifications} onClick={onMarkAllReadClick} />
            <Notifications notifications={notifications} />
            <Link to='/notifications' onClick={onDropdownDismiss}>
              <div className='center blue p3 border-top border-gray80'>
                See All<span className='pl3'><ChevronRight /></span>
              </div>
            </Link>
          </div>
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default NotificationsBell
