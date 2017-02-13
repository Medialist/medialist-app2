import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import SortableHeader from '../tables/sortable-header'
import SelectableRow from '../tables/selectable-row'
import Checkbox from '../tables/checkbox'
import { TimeFromNow } from '../time/time'
import YouOrName from '../users/you-or-name'
import { CircleAvatar } from '../images/avatar'
import isSameItems from '../lists/is-same-items'
import StatusSelector from '../feedback/status-selector'
import Loading from '../lists/loading'

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
    onSelectionsChange: PropTypes.func,
    // Optional campaign for calculating a contacts status
    campaign: PropTypes.object,
    // Callback when contact status is changed
    onStatusChange: PropTypes.func,
    // returns true while subscriptionts are still syncing data.
    loading: PropTypes.bool
  },

  onSelectAllChange () {
    let selections

    if (isSameItems(this.props.selections, this.props.contacts)) {
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
    const { sort, onSortChange, contacts, selections, campaign, onStatusChange, loading } = this.props

    if (!loading && !contacts.length) {
      return <p className='pt2 pb5 mt0 f-xl semibold center'>No contacts found</p>
    }

    const selectionsById = selections.reduce((memo, selection) => {
      memo[selection._id] = selection
      return memo
    }, {})

    return (
      <div>
        <table className='table'>
          <thead>
            <tr className='bg-gray90'>
              <th className='center' style={{width: 55}}>
                <Checkbox
                  checked={isSameItems(selections, contacts)}
                  onChange={this.onSelectAllChange} />
              </th>
              <SortableHeader
                className='left-align'
                sortDirection={sort['name']}
                style={{width: '20%'}}
                onSortChange={(d) => onSortChange({ name: d })}>
                Name
              </SortableHeader>
              <SortableHeader
                className='left-align'
                sortDirection={sort['outlets.value']}
                onSortChange={(d) => onSortChange({ 'outlets.value': d })}>
                Title
              </SortableHeader>
              <SortableHeader
                className='left-align'
                sortDirection={sort['outlets.label']}
                style={{width: '20%'}}
                onSortChange={(d) => onSortChange({ 'outlets.label': d })}>
                Media Outlet
              </SortableHeader>
              <th className='left-align' style={{width: '15%'}}>Email</th>
              <th className='left-align' style={{width: '15%'}}>Phone</th>
              <SortableHeader
                className='left-align'
                sortDirection={sort['updatedAt']}
                style={{width: '11%'}}
                onSortChange={(d) => onSortChange({ updatedAt: d })}>
                Updated
              </SortableHeader>
              {campaign && (
                <th className='left-align' style={{width: '15%'}}>Status</th>
              )}
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const {
                _id,
                name,
                avatar,
                slug,
                emails,
                outlets,
                phones,
                updatedAt,
                updatedBy
              } = contact
              const status = campaign && campaign.contacts[slug]
              return (
                <SelectableRow data={contact} selected={!!selectionsById[_id]} onSelectChange={this.onSelectChange} key={_id}>
                  <td className='left-align'>
                    <Link to={`/contact/${slug}`} className='nowrap'>
                      <CircleAvatar avatar={avatar} name={name} />
                      <span className='ml3 semibold'>{name}</span>
                    </Link>
                  </td>
                  <td className='left-align'>{(outlets && outlets.length) ? outlets[0].value : null}</td>
                  <td className='left-align'>{(outlets && outlets.length) ? outlets[0].label : null}</td>
                  <td className='left-align'>
                    <DisplayEmail emails={emails} />
                  </td>
                  <td className='left-align'>
                    <DisplayPhone phones={phones} />
                  </td>
                  <td className='left-align'>
                    <TimeFromNow className='semibold f-sm' date={updatedAt} />
                    <div className='normal f-sm'>by <YouOrName user={updatedBy} /></div>
                  </td>
                  {campaign && (
                    <td className='left-align'>
                      <StatusSelector status={status} onChange={(status) => onStatusChange({status, contact})} />
                    </td>
                  )}
                </SelectableRow>
              )
            })}
          </tbody>
        </table>
        { loading && <div className='center p4'><Loading /></div> }
      </div>
    )
  }
})

const DisplayEmail = ({ emails }) => {
  if (!emails || !emails.length) return null
  return <a href={`mailto:${emails[0].value}`}>{emails[0].value}</a>
}

const DisplayPhone = ({ phones }) => {
  if (!phones || !phones.length) return null
  return <a href={`tel:${phones[0].value}`}>{phones[0].value}</a>
}

export default ContactsTable
