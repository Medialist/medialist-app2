import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import escapeRegExp from 'lodash.escaperegexp'

const DEFAULT_LIMIT = 2000

Meteor.publish(null, function () {
  if (!this.userId) {
    return this.ready()
  }

  return Meteor.users.find({
    _id: this.userId
  }, {
    fields: {
      createdAt: 1,
      myCampaigns: 1,
      myContacts: 1,
      onCampaigns: 1,
      emails: 1,
      recentCampaignLists: 1,
      recentContactLists: 1
    }
  })
})

Meteor.publish('users', function (opts = {}) {
  if (!this.userId) return this.ready()

  check(opts, {
    term: Match.Optional(String),
    limit: Match.Optional(Number)
  })

  let query = {
    _id: {
      $ne: this.userId
    }
  }

  const options = {
    fields: {
      'profile.name': 1,
      'profile.avatar': 1,
      'onCampaigns': 1,
      'emails': 1
    },
    sort: { createdAt: -1 },
    limit: opts.limit || DEFAULT_LIMIT
  }

  if (opts.term) {
    const regex = new RegExp(`${escapeRegExp(opts.term)}`, 'gi')

    query = {
      $or: [{
        'profile.name': regex
      }, {
        'services.twitter.screenName': regex
      }, {
        'emails.address': regex
      }]
    }
  }

  return Meteor.users.find(query, options)
})

Meteor.publish('users-by-id', function (opts = {}) {
  if (!this.userId) {
    return this.ready()
  }

  check(opts, {
    userIds: Array,
    limit: Match.Optional(Number)
  })

  const query = {
    _id: {
      $in: opts.userIds
    }
  }

  const options = {
    fields: {
      'profile.name': 1,
      myContacts: 1,
      myCampaigns: 1,
      emails: 1
    },
    sort: {
      createdAt: -1
    },
    limit: opts.limit || DEFAULT_LIMIT
  }
  return Meteor.users.find(query, options)
})
