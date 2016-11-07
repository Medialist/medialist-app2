import React, { PropTypes } from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import Authenticator from './users/authenticator'
import NavBar from './navigation/navbar'

const Layout = React.createClass({
  propTypes: {
    user: PropTypes.object
  },

  render () {
    const { children, user, notifications } = this.props
    return (
      <Authenticator user={user}>
        <div>
          <NavBar user={user} notifications={notifications} />
          {children}
        </div>
      </Authenticator>
    )
  }
})

export default createContainer(() => {
  const user = Meteor.user()
  const notifications = notificationsDummyData
  return { user, notifications }
}, Layout)

// dummy data in lieu of actual notifications
const notificationsDummyData = [{'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/krasnoukhov/128.jpg', 'icon': 'FeedCoverageIcon', 'name': 'Grace Roob', 'notification': 'Et est aspernatur repudiandae vel sunt accusamus est placeat.', 'campaign': 'Cronin, Hettinger and Toy', 'time': '2016-06-20T00:49:36.163Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/shinze/128.jpg', 'icon': 'FeedCoverageIcon', 'name': 'Enid Heaney', 'notification': 'Aut dignissimos cum iste.', 'campaign': 'Yost Inc', 'time': '2016-02-06T12:13:24.040Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/marcomano_/128.jpg', 'icon': 'FeedCampaignIcon', 'name': 'Una Strosin', 'notification': 'Ratione vero voluptates.', 'campaign': 'Gottlieb Inc', 'time': '2016-01-05T22:17:41.075Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/wim1k/128.jpg', 'icon': 'FeedCampaignIcon', 'name': 'Ruthe Beatty', 'notification': 'Aliquid quis itaque consequatur voluptas.', 'campaign': 'Corwin - Dicki', 'time': '2015-12-02T14:00:45.239Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/mkginfo/128.jpg', 'icon': 'FeedNeedToKnowIcon', 'name': 'Breanne Nolan', 'notification': 'Sunt modi ducimus ut ut id expedita sunt ipsum.', 'campaign': 'Brekke, Kling and Kuhn', 'time': '2016-04-30T11:08:08.870Z', 'read': true}]
