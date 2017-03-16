const StatusMap = {
  completed: 'Completed',
  hotLead: 'Hot Lead',
  contacted: 'Contacted',
  toContact: 'To Contact',
  notInterested: 'Not Interested'
}

export default StatusMap

export const StatusValues = Object.keys(StatusMap).map((k) => StatusMap[k])

// { 'Completed': 0, 'Hot Lead': 1, ... }
export const StatusIndex = StatusValues.reduce((StatusIndex, s, i) => {
  StatusIndex[s] = i
  return StatusIndex
}, {})
