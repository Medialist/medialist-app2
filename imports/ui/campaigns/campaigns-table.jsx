import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import SortableHeader from '../tables/sortable-header'
import SelectableRow from '../tables/selectable-row'
import Checkbox from '../tables/checkbox'
import { TimeFromNow } from '../time/time'
import YouOrName from '../users/you-or-name'
import { SquareAvatar } from '../images/avatar'
import isSameItems from '../lists/is-same-items'
import StatusLabel from '../feedback/status-label'
import StatusSelectorContainer from '../feedback/status-selector-container'

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
    onSelectionsChange: PropTypes.func,
    // Callback when contact status is changed
    onStatusChange: PropTypes.func,
    // returns true while subscriptionts are still syncing data.
    loading: PropTypes.bool,
    // true if we are searching
    searching: PropTypes.bool
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
    const { sort, onSortChange, campaigns, selections, loading, contactSlug } = this.props

    if (!loading && !campaigns.length) {
      return <p className='p4 mb2 f-xl semibold center'>No campaigns yet</p>
    }

    const selectionsById = selections.reduce((memo, selection) => {
      memo[selection._id] = selection
      return memo
    }, {})

    return (
      <table className='table' data-id={`campaigns-table${this.props.searching ? '-search-results' : '-unfiltered'}`}>
        <thead>
          <tr className='bg-gray90'>
            <th className='right-align' style={{width: 34, paddingRight: 0, borderRight: '0 none'}}>
              <Checkbox
                checked={isSameItems(selections, campaigns)}
                onChange={this.onSelectAllChange} />
            </th>
            <SortableHeader
              className='left-align'
              style={{borderLeft: '0 none'}}
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
            <th className='left-align' style={{width: '40%'}}>Key Message</th>
            {contactSlug && (
              <SortableHeader
                className='left-align'
                sortDirection={sort['status']}
                onSortChange={(d) => onSortChange({ 'status': d })}>
                Status
              </SortableHeader>
            )}
            <SortableHeader
              className='left-align'
              sortDirection={sort['updatedAt']}
              onSortChange={(d) => onSortChange({ updatedAt: d })}>
              Updated
            </SortableHeader>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign, index) => {
            const { _id, slug, name, avatar, client, purpose, updatedAt, updatedBy } = campaign
            const clientName = client && client.name
            return (
              <SelectableRow data={campaign} selected={!!selectionsById[_id]} onSelectChange={this.onSelectChange} key={_id} data-id={`campaigns-table-row-${index}`}>
                <td className='left-align'>
                  <Link to={`/campaign/${slug}`} className='nowrap' data-id='campaign-link'>
                    <SquareAvatar avatar={avatar} name={name} />
                    <span className='ml3 semibold'>{name}</span>
                  </Link>
                </td>
                <td className='left-align truncate'>
                  {clientName || <span className='gray60'>No client</span>}
                </td>
                <td className='left-align truncate'>
                  {purpose || <span className='gray60'>No key message</span>}
                </td>
                {contactSlug && (
                  <td className='left-align' style={{overflow: 'visible'}}>
                    <StatusSelectorContainer
                      contactSlug={contactSlug}
                      campaign={campaign}
                      children={(status) => <StatusLabel name={status} />}
                    />
                  </td>
                )}
                <td className='left-align'>
                  <span className='semibold'><TimeFromNow date={updatedAt} /></span>
                  <span> by <YouOrName user={updatedBy} /></span>
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
