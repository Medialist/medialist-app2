import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import escapeRegExp from 'lodash.escaperegexp'

const DEFAULT_LIMIT = 50

Meteor.publish(null, function () {
  if (!this.userId) return this.ready()

  return Meteor.users.find(
    {_id: this.userId},
    {fields: {'services.twitter.profile_image_url_https': 1, myMedialists: 1, myContacts: 1}}
  )
})

Meteor.publish('users', function (opts = {}) {
  if (!this.userId) return this.ready()

  check(opts, {
    term: Match.Optional(String),
    limit: Match.Optional(Number)
  })

  let query = { _id: { $ne: this.userId } }
  const options = {
    fields: {
      'profile.name': 1,
      'services.twitter.profile_image_url_https': 1
    },
    sort: { createdAt: -1 },
    limit: opts.limit || DEFAULT_LIMIT
  }

  if (opts.term) {
    const regex = new RegExp(`${escapeRegExp(opts.term)}`, 'gi')

    query = { $or: [
      { 'profile.name': regex },
      { 'services.twitter.screenName': regex }
    ] }
  }
/*
else {
    // By default, show users in the same teams as me
    const weightedUserIds = Medialists
      .find(
        { 'team._id': this.userId },
        { fields: { team: 1 }, sort: { updatedAt: -1 }, limit: 10 }
      )
      .fetch()
      .reduce((userIds, medialist) => {
        (medialist.team || []).forEach((user) => {
          userIds[user._id] = userIds[user._id] || 0
          userIds[user._id]++
        })
        return userIds
      }, {})

    const $or = Object.keys(weightedUserIds)
      .map((id) => ({ id, count: weightedUserIds[id] }))
      .sort((a, b) => a.count - b.count)
      .map(({ id }) => ({ 'team._id': id }))

    query.$or.push({})
    query.$or = $or
  }
*/

  return Meteor.users.find(query, options)
})
