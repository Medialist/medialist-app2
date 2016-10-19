import React, { PropTypes } from 'react'
import SortableHeader from '../tables/sortable-header'

const CampaignsTable = React.createClass({
  propTypes: {
    // e.g. { updatedAt: -1 }
    sort: PropTypes.object,
    // Callback when sort changes, passed e.g. { updatedAt: 1 }
    onSortChange: PropTypes.func,
    // Data rows to render in the table
    campaigns: PropTypes.array
  },

  render () {
    const { sort, onSortChange, campaigns } = this.props

    if (!campaigns.length) {
      return <p className='p4 mb2 f-xl semibold center'>No campaigns yet</p>
    }

    return (
      <table>
        <thead>
          <tr>
            <th>
              <input type='checkbox' />
            </th>
            <SortableHeader
              key='name'
              sortDirection={sort['name']}
              onSortChange={(d) => onSortChange({ name: d })}>
              Name
            </SortableHeader>
            <SortableHeader
              key='jobTitle'
              sortDirection={sort['jobTitle']}
              onSortChange={(d) => onSortChange({ jobTitle: d })}>
              Title
            </SortableHeader>
            <SortableHeader
              key='mediaOutlets'
              sortDirection={sort['mediaOutlets']}
              onSortChange={(d) => onSortChange({ mediaOutlets: d })}>
              Media Outlet
            </SortableHeader>
            <th key='email'>Email</th>
            <th key='phone'>Phone</th>
            <SortableHeader
              key='updatedAt'
              sortDirection={sort['updatedAt']}
              onSortChange={(d) => onSortChange({ updatedAt: d })}>
              Updated
            </SortableHeader>
          </tr>
        </thead>
      </table>
    )
  }
})

export default CampaignsTable
