import React from 'react'
import faker from 'faker'
import Notification from './notification'

// mock data generator
const data = Array.apply(null, {length: 4}).map(function () { return makeAFakeNotification() })

function makeAFakeNotification () {
  return {
    avatar: faker.image.avatar(),
    icon: ['FeedCampaignIcon', 'FeedCoverageIcon', 'FeedFeebackIcon', 'FeedNeedToKnowIcon'][Math.floor(Math.random() * 4)],
    name: faker.name.firstName() + ' ' + faker.name.lastName(),
    notification: faker.lorem.sentence(),
    campaign: faker.company.companyName(),
    time: faker.date.past()
  }
}

export default () => (<div>{data.map(function (dat, i) {
  return <Notification notification={dat} key={i} />
})}</div>)
