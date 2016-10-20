import React, { PropTypes } from 'react'
import SortableHeader from '../tables/sortable-header'
import SelectableRow from '../tables/selectable-row'
import FromNow from '../time/from-now'
import YouOrName from '../users/you-or-name'
import { SquareAvatar } from '../images/avatar'
import isSameItems from '../lists/is-same-items'

const CampaignsTable = React.createClass({
  propTypes: {
    // e.g. { updatedAt: -1 }
    sort: PropTypes.object,
    // Callback when sort changes, passed e.g. { updatedAt: 1 }
    onSortChange: PropTypes.func,
    // Data rows to render in the table
    campaigns: PropTypes.array,
    // Selected campaigns in the table
    selections: PropTypes.array,
    // Callback when selection(s) change
    onSelectionsChange: PropTypes.func
  },

  onSelectAllChange () {
    let selections

    if (isSameItems(this.props.selections, this.props.campaigns)) {
      selections = []
    } else {
      selections = this.props.campaigns.slice()
    }

    this.props.onSelectionsChange(selections)
  },

  onSelectChange (campaign) {
    let { selections } = this.props
    const index = selections.findIndex((c) => c._id === campaign._id)

    if (index === -1) {
      selections = selections.concat([campaign])
    } else {
      selections.splice(index, 1)
      selections = Array.from(selections)
    }

    this.props.onSelectionsChange(selections)
  },

  render () {
    const { sort, onSortChange, campaigns, selections } = this.props

    if (!campaigns.length) {
      return <p className='p4 mb2 f-xl semibold center'>No campaigns yet</p>
    }

    const selectionsById = selections.reduce((memo, selection) => {
      memo[selection._id] = selection
      return memo
    }, {})

    return (
      <table className='table'>
        <thead>
          <tr className='bg-gray90'>
            <th className='center' style={{width: 55}}>
              <input
                type='checkbox'
                checked={isSameItems(selections, campaigns)}
                onChange={this.onSelectAllChange} />
            </th>
            <SortableHeader
              className='left-align'
              sortDirection={sort['name']}
              onSortChange={(d) => onSortChange({ name: d })}>
              Name
            </SortableHeader>
            <SortableHeader
              className='left-align'
              sortDirection={sort['client.name']}
              onSortChange={(d) => onSortChange({ 'client.name': d })}>
              Client
            </SortableHeader>
            <th className='left-align'>Key Message</th>
            <SortableHeader
              className='left-align'
              sortDirection={sort['updatedAt']}
              onSortChange={(d) => onSortChange({ updatedAt: d })}>
              Updated
            </SortableHeader>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const { _id, name, avatar, client, purpose, updatedAt, updatedBy } = campaign
            return (
              <SelectableRow data={campaign} selected={!!selectionsById[_id]} onSelectChange={this.onSelectChange} key={_id}>
                <td className='left-align'>
                  <SquareAvatar avatar={avatar} name={name} />
                  <span className='ml3 semibold'>{name}</span>
                </td>
                <td className='left-align'>{client.name}</td>
                <td className='left-align'>{purpose}</td>
                <td className='left-align'>
                  <FromNow date={updatedAt} /> by <YouOrName user={updatedBy} />
                </td>
              </SelectableRow>
            )
          })}
        </tbody>
      </table>
    )
  }
})

export default CampaignsTable
