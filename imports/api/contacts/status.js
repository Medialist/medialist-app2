const StatusMap = {
  completed: 'Completed',
  hotLead: 'Hot Lead',
  contacted: 'Contacted',
  toContact: 'To Contact',
  notInterested: 'Not Interested'
}

export default StatusMap

export const StatusValues = Object.keys(StatusMap).map((k) => StatusMap[k])
