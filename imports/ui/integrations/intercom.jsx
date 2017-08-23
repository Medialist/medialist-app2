import moment from 'moment'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ReactIntercom from 'react-intercom'

const { intercom } = Meteor.settings.public
const appId = intercom && intercom.appId
const shouldRender = appId && Meteor.isClient

export default !shouldRender ? () => null : createContainer(() => {
  const user = Meteor.user()
  const {hostname} = window.location
  const deployment = hostname.split('.')[0]

  let userData = {
    hostname,
    deployment
  }

  if (user) {
    userData = {
      ...userData,
      user_id: user._id,
      name: user.profile.name,
      email: user.emails[0].address,
      created_at: moment(user.createdAt).unix(),
      my_campaigns: user.myCampaigns.length,
      my_contacts: user.myContacts.length
    }
  }

  return { appID: appId, ...userData }
}, ReactIntercom)
