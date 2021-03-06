import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Button from 'rebass/dist/Button'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'
import { NotificationBell, ChevronRight } from '/imports/ui/images/icons'
import { Notifications, NotificationsSummary } from '/imports/ui/users/notification'

class NotificationsBell extends React.Component {
  propTypes = {
    notifications: PropTypes.array
  }

  state = {
    isDropdownOpen: false
  }

  onBellClick = () => {
    this.setState({ isDropdownOpen: true })
  }

  onDropdownDismiss = () => {
    this.setState({ isDropdownOpen: false })
  }

  onSeeAllClick = () => {
    this.setState({ isDropdownOpen: false })
  }

  onMarkAllReadClick = () => {
    console.log('TODO: Mark all read')
  }

  render () {
    const { onBellClick, onMarkAllReadClick, onDropdownDismiss } = this
    const { isDropdownOpen } = this.state
    return (
      <Dropdown>
        <Button backgroundColor='transparent' onClick={onBellClick}><NotificationBell /></Button>
        <DropdownMenu width={480} open={isDropdownOpen} onDismiss={onDropdownDismiss}>
          <div>
            <NotificationsSummary notifications={notifications} onMarkAllReadClick={onMarkAllReadClick} />
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
}

// dummy data in lieu of actual notifications
const notifications = [{'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/krasnoukhov/128.jpg', 'icon': 'FeedCoverageIcon', 'name': 'Grace Roob', 'notification': 'Et est aspernatur repudiandae vel sunt accusamus est placeat.', 'campaign': 'Cronin, Hettinger and Toy', 'time': '2016-06-20T00:49:36.163Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/shinze/128.jpg', 'icon': 'FeedCoverageIcon', 'name': 'Enid Heaney', 'notification': 'Aut dignissimos cum iste.', 'campaign': 'Yost Inc', 'time': '2016-02-06T12:13:24.040Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/marcomano_/128.jpg', 'icon': 'FeedCampaignIcon', 'name': 'Una Strosin', 'notification': 'Ratione vero voluptates.', 'campaign': 'Gottlieb Inc', 'time': '2016-01-05T22:17:41.075Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/wim1k/128.jpg', 'icon': 'FeedCampaignIcon', 'name': 'Ruthe Beatty', 'notification': 'Aliquid quis itaque consequatur voluptas.', 'campaign': 'Corwin - Dicki', 'time': '2015-12-02T14:00:45.239Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/mkginfo/128.jpg', 'icon': 'FeedNeedToKnowIcon', 'name': 'Breanne Nolan', 'notification': 'Sunt modi ducimus ut ut id expedita sunt ipsum.', 'campaign': 'Brekke, Kling and Kuhn', 'time': '2016-04-30T11:08:08.870Z', 'read': true}]

export default NotificationsBell
