import { Meteor } from 'meteor/meteor'

export const userRefAutoRelease = (field) => (data, diff, nextData) => {
  // console.log('should autoRelease', diff)
  const byUser = (doc) => doc[field] && doc[field]._id === Meteor.userId()

  // If the current user added or updated some docs then release
  if (diff.added.some((byUser)) || diff.updated.some((byUser))) {
    // console.log('YES: items added/updated by user')
    return true
  }

  // Just release when removes happen, there's no way to know that the
  // logged in user deleted a thing since it is absent
  if (diff.total.removed) {
    // ...but, was this really a remove, or an addition to a paginated list
    // that forced a remove of an item at the back?
    // [a, b, c] -> [x, a, b]

    // If nothing was added then this really was a remove
    if (!diff.total.added) {
      // console.log('YES: items removed but nothing added')
      return true
    }

    // So, things were added, but were all the removes from the end?
    const endItems = data.slice(-diff.total.removed)
    const removedFromEnd = endItems.every((endItem) => {
      return diff.removed.some((item) => item._id === endItem._id)
    })

    // If they weren't all removed from the end, auto-release
    if (!removedFromEnd) {
      // console.log('YES: items NOT removed from the end')
      return true
    }
  }

  if (diff.total.added) {
    // So, things were added, were all the items added to the end?
    // If so, then it's likely a remove has occurred previously and then
    // an add has occurred to fill the space:
    // [a, b, c] -> [b, c] -> [b, c, d]
    const endItems = nextData.slice(-diff.total.added)
    const addedToEnd = endItems.every((endItem) => {
      return diff.added.some((item) => item._id === endItem._id)
    })

    if (addedToEnd) {
      // console.log('YES: all the items added were added to the end')
      return true
    }
  }

  // console.log('NO')
  return false
}

export const updatedByUserAutoRelease = userRefAutoRelease('updatedBy')
export const createdByUserAutoRelease = userRefAutoRelease('createdBy')
