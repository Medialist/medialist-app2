import { Meteor } from 'meteor/meteor'

export const userRefAutoRelease = (field) => (data, diff) => {
  const byUser = (doc) => doc[field] && doc[field]._id === Meteor.userId()

  // If the current user added or updated some docs then release
  if (diff.added.some((byUser)) || diff.updated.some((byUser))) {
    return true
  }

  // Just release when deletions happen, there's no way to know that the
  // logged in user deleted a thing since it is absent
  if (diff.total.removed) {
    // Was this really a remove, or just an addition on a paginated list?
    // If the latter, one was added to the front and it pushed one out from the back..
    if (diff.total.added === 1 && diff.total.removed === 1 && diff.removed[0]._id === data[data.length - 1]._id) {
      // Do not auto release
    } else {
      return true
    }
  }

  return false
}

export const updatedByUserAutoRelease = userRefAutoRelease('updatedBy')
export const createdByUserAutoRelease = userRefAutoRelease('createdBy')
