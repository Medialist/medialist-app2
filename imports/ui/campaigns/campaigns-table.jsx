import React, { PropTypes } from 'react'
import SortableHeader from '../tables/sortable-header'
import SelectableRow from '../tables/selectable-row'
import FromNow from '../time/from-now'
import YouOrName from '../users/you-or-name'
import { SquareAvatar } from '../images/avatar'

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
      <div className='bg-white shadow-2 m4'>
        <div className='p4'>
          <input className='input mb0' type='search' name='search' placeholder='Search campaigns...' />
        </div>
        <table className='table'>
          <thead>
            <tr className='bg-gray90'>
              <th className='center' style={{width:55}}>
                <input
                  type='checkbox'
                  checked={selections.length === campaigns.length}
                  onChange={this.onSelectAllChange} />
              </th>
              <SortableHeader
                key='name'
                className='left-align'
                sortDirection={sort['name']}
                onSortChange={(d) => onSortChange({ name: d })}>
                Name
              </SortableHeader>
              <SortableHeader
                key='client.name'
                className='left-align'
                sortDirection={sort['client.name']}
                onSortChange={(d) => onSortChange({ 'client.name': d })}>
                Client
              </SortableHeader>
              <th className='left-align' key='purpose'>Key Message</th>
              <SortableHeader
                key='updatedAt'
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
      </div>
    )
  }
})

export default CampaignsTable
