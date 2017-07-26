import { Meteor } from 'meteor/meteor'
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate'
import StatusMap from '/imports/api/contacts/status'
import CampaignContacts from '/imports/api/campaign-contacts/campaign-contacts'

Meteor.publish('campaign-contact-statuses', function (campaignSlug) {
  if (!this.userId) {
    return this.ready()
  }

  const group = Object.keys(StatusMap).reduce((group, status) => {
    group[status] = {
      $sum: {
        $cond: [{
          $eq: ['$status', StatusMap[status]]
        }, 1, 0]
      }
    }

    return group
  }, {
    _id: null
  })

  const project = Object.keys(StatusMap).reduce((project, status) => {
    project[StatusMap[status]] = `$${status}`

    return project
  }, {
    _id: '$status'
  })

  ReactiveAggregate(this, CampaignContacts, [{
    $match: {
      campaign: campaignSlug
    }
  }, {
    $group: group
  }, {
    $project: project
  }], {
    clientCollection: 'campaign-contact-statuses-client'
  })
})

Meteor.publish('contact-campaign-statuses', function (contactSlug) {
  if (!this.userId) {
    return this.ready()
  }

  const group = Object.keys(StatusMap).reduce((group, status) => {
    group[status] = {
      $sum: {
        $cond: [{
          $eq: ['$status', StatusMap[status]]
        }, 1, 0]
      }
    }

    return group
  }, {
    _id: null
  })

  const project = Object.keys(StatusMap).reduce((project, status) => {
    project[StatusMap[status]] = `$${status}`

    return project
  }, {
    _id: '$status'
  })

  ReactiveAggregate(this, CampaignContacts, [{
    $match: {
      slug: contactSlug
    }
  }, {
    $group: group
  }, {
    $project: project
  }], {
    clientCollection: 'contact-campaign-statuses-client'
  })
})
