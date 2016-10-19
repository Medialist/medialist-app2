import React, { PropTypes } from 'react'
import SortableHeader from '../tables/sortable-header'
import classnames from 'classnames'
import FromNow from '../time/from-now'
import YouOrName from '../users/you-or-name'

const CampaignsTable = React.createClass({
  propTypes: {
    // e.g. { updatedAt: -1 }
    sort: PropTypes.object,
    // Callback when sort changes, passed e.g. { updatedAt: 1 }
    onSortChange: PropTypes.func,
    // Data rows to render in the table
    campaigns: PropTypes.array,
    // Callback when selection(s) change
    onSelectionsChange: PropTypes.func
  },

  getInitialState () {
    return { selections: [] }
  },

  onSelectAllChange () {
    let selections

    if (this.state.selections.length === this.props.campaigns.length) {
      selections = []
    } else {
      selections = this.props.campaigns.slice()
    }

    this.setState({ selections })
    this.props.onSelectionsChange(selections)
  },

  onSelectChange (campaign) {
    const { selections } = this.state
    const index = selections.findIndex((c) => c._id === campaign._id)

    if (index === -1) {
      this.setState({ selections: selections.concat([campaign]) })
    } else {
      selections.splice(index, 1)
      this.setState({ selections })
    }

    this.props.onSelectionsChange(selections)
  },

  render () {
    const { sort, onSortChange, campaigns } = this.props

    if (!campaigns.length) {
      return <p className='p4 mb2 f-xl semibold center'>No campaigns yet</p>
    }

    const { selections } = this.state
    const selectionsById = selections.reduce((memo, selection) => {
      memo[selection._id] = selection
      return memo
    }, {})

    return (
      <table>
        <thead>
          <tr>
            <th>
              <input
                type='checkbox'
                checked={selections.length === campaigns.length}
                onChange={this.onSelectAllChange} />
            </th>
            <SortableHeader
              key='name'
              sortDirection={sort['name']}
              onSortChange={(d) => onSortChange({ name: d })}>
              Name
            </SortableHeader>
            <SortableHeader
              key='client.name'
              sortDirection={sort['client.name']}
              onSortChange={(d) => onSortChange({ 'client.name': d })}>
              Client
            </SortableHeader>
            <th key='purpose'>Key Message</th>
            <SortableHeader
              key='updatedAt'
              sortDirection={sort['updatedAt']}
              onSortChange={(d) => onSortChange({ updatedAt: d })}>
              Updated
            </SortableHeader>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const { _id, name, client, purpose, updatedAt, updatedBy } = campaign
            const active = !!selectionsById[_id]
            return (
              <tr className={classnames({ active })} key={_id}>
                <td>
                  <input type='checkbox' checked={active} onChange={() => this.onSelectChange(campaign)} />
                </td>
                <td>{name}</td>
                <td>{client.name}</td>
                <td>{purpose}</td>
                <td>
                  <FromNow date={updatedAt} /> by <YouOrName user={updatedBy} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
})

export default CampaignsTable
