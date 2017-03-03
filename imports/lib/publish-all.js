import { Meteor } from 'meteor/meteor'

export const publishAll = (queryMap, publishFn) => {
  Object.keys(queryMap).forEach((name) => {
    const query = queryMap[name]
    Meteor.publish(name, publishFn(query))
  })
}

export const publishAllForLoggedInUser = (queryMap) => {
  publishAll(queryMap, (query) => function (opts) {
    // Ensure we have logged in user first.
    if (!this.userId) return this.ready()
    const cursor = query(opts)
    return cursor || this.ready()
  })
}

export const publishAllForAnyone = (queryMap) => {
  publishAll(queryMap, (query) => function (opts) {
    return query(opts) || this.ready()
  })
}
