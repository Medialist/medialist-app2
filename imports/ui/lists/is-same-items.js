// Ensure the items in each list are the same (compared by _id property)
// Order doesn't matter, assumes no duplicates
export default function isSameItems (listA, listB, isSameItem = isSameItemById) {
  if (listA === listB) return true
  if (listA.length !== listB.length) return false
  return listA.every((itemA) => {
    return listB.some((itemB) => isSameItem(itemA, itemB))
  })
}

export const isSameItemById = (a, b) => a._id === b._id
