import React from 'react'
import { Notifications } from './notification'

export default () => (
  <div className='block max-width-lg mx-auto my4 pt3'>
    {NotificationSummary(3)}
    <div className='shadow-2 mt4'>{Notifications({notifications})}</div>
  </div>
)

const NotificationSummary = (count) => {
  return (
    <div className='flex items-center my3 pa3'>
      <div className='flex-none'>
        <span className='ml2 px2 py1 bg-not-interested circle inline-block white'>{count}</span>
        <span className='px1'>Unread notifications</span>
      </div>
      <hr className='flex-auto mx2' style={{height: 1}} />
      <span className='mr2 flex-none'>Mark all as read</span>
    </div>
  )
}
// dummy data in lieu of actual notifications
const notifications = [{'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/krasnoukhov/128.jpg', 'icon': 'FeedCoverageIcon', 'name': 'Grace Roob', 'notification': 'Et est aspernatur repudiandae vel sunt accusamus est placeat.', 'campaign': 'Cronin, Hettinger and Toy', 'time': '2016-06-20T00:49:36.163Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/shinze/128.jpg', 'icon': 'FeedCoverageIcon', 'name': 'Enid Heaney', 'notification': 'Aut dignissimos cum iste.', 'campaign': 'Yost Inc', 'time': '2016-02-06T12:13:24.040Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/marcomano_/128.jpg', 'icon': 'FeedCampaignIcon', 'name': 'Una Strosin', 'notification': 'Ratione vero voluptates.', 'campaign': 'Gottlieb Inc', 'time': '2016-01-05T22:17:41.075Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/wim1k/128.jpg', 'icon': 'FeedCampaignIcon', 'name': 'Ruthe Beatty', 'notification': 'Aliquid quis itaque consequatur voluptas.', 'campaign': 'Corwin - Dicki', 'time': '2015-12-02T14:00:45.239Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/mkginfo/128.jpg', 'icon': 'FeedNeedToKnowIcon', 'name': 'Breanne Nolan', 'notification': 'Sunt modi ducimus ut ut id expedita sunt ipsum.', 'campaign': 'Brekke, Kling and Kuhn', 'time': '2016-04-30T11:08:08.870Z', 'read': true}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/BillSKenney/128.jpg', 'icon': 'FeedNeedToKnowIcon', 'name': 'Roberto Hermiston', 'notification': 'Animi odit dolorum at nemo.', 'campaign': 'Hoppe, Tillman and Morissette', 'time': '2015-11-03T15:34:51.635Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/gonzalorobaina/128.jpg', 'icon': 'FeedCoverageIcon', 'name': 'Mackenzie Grant', 'notification': 'Quae neque ut ea excepturi ab.', 'campaign': 'Blanda - Wunsch', 'time': '2015-12-12T17:28:49.724Z', 'read': true}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/amywebbb/128.jpg', 'icon': 'FeedCampaignIcon', 'name': 'Trisha Mraz', 'notification': 'Sint odit ut blanditiis et ea quis est dolore.', 'campaign': 'Greenfelder Group', 'time': '2016-03-01T16:54:32.601Z', 'read': false}, {'avatar': 'https://s3.amazonaws.com/uifaces/faces/twitter/kevinoh/128.jpg', 'icon': 'FeedCoverageIcon', 'name': 'Carlie Oberbrunner', 'notification': 'Omnis dolores qui itaque cum.', 'campaign': 'Feil - Jaskolski', 'time': '2016-01-30T14:34:43.014Z', 'read': true}]
