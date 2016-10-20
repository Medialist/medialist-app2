import React, { PropTypes } from 'react'
import SortableHeader from '../tables/sortable-header'
import SelectableRow from '../tables/selectable-row'
import FromNow from '../time/from-now'
import YouOrName from '../users/you-or-name'
import { CircleAvatar } from '../images/avatar'

const ContactsTable = React.createClass({
  propTypes: {
    // e.g. { updatedAt: -1 }
    sort: PropTypes.object,
    // Callback when sort changes, passed e.g. { updatedAt: 1 }
    onSortChange: PropTypes.func,
    // Data rows to render in the table
    contacts: PropTypes.array,
    // Selected contacts in the table
    selections: PropTypes.array,
    // Callback when selection(s) change
    onSelectionsChange: PropTypes.func
  },

  onSelectAllChange () {
    let selections

    if (this.props.selections.length === this.props.contacts.length) {
      selections = []
    } else {
      selections = this.props.contacts.slice()
    }

    this.props.onSelectionsChange(selections)
  },

  onSelectChange (contact) {
    let { selections } = this.props
    const index = selections.findIndex((c) => c._id === contact._id)

    if (index === -1) {
      selections = selections.concat([contact])
    } else {
      selections.splice(index, 1)
      selections = Array.from(selections)
    }

    this.props.onSelectionsChange(selections)
  },

  render () {
    const { sort, onSortChange, contacts, selections } = this.props

    if (!contacts.length) {
      return <p className='p4 mb2 f-xl semibold center'>No contacts yet</p>
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
                checked={selections.length === contacts.length}
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
          {contacts.map((contact) => {
            const {
              _id,
              name,
              avatar,
              jobTitle,
              mediaOutlets,
              email,
              phone,
              updatedAt,
              updatedBy
            } = contact

            return (
              <SelectableRow data={contact} selected={!!selectionsById[_id]} onSelectChange={this.onSelectChange} key={_id}>
                <td className='left-align'>
                  <CircleAvatar avatar={avatar} name={name} />
                  <span className='ml3 semibold'>{name}</span>
                </td>
                <td className='left-align'>{jobTitle}</td>
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

export default ContactsTable
