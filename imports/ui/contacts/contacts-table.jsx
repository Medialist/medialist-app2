import React from 'react'
import PropTypes from 'prop-types'
import { Link, withRouter } from 'react-router'
import SortableHeader from '/imports/ui/tables/sortable-header'
import SelectableRow from '/imports/ui/tables/selectable-row'
import Checkbox from '/imports/ui/tables/checkbox'
import { TimeAgo } from '/imports/ui/time/time'
import YouOrName from '/imports/ui/users/you-or-name'
import { CircleAvatar } from '/imports/ui/images/avatar'
import StatusLabel from '/imports/ui/feedback/status-label'
import StatusSelectorContainer from '/imports/ui/feedback/status-selector-container'

const ContactLink = ({contact, onClick}) => {
  const {slug, name, avatar} = contact
  return (
    <Link onClick={onClick} to={`/contact/${slug}`} className='nowrap' data-id='contact-link' data-contact={slug}>
      <CircleAvatar avatar={avatar} name={name} />
      <span className='ml3 semibold'>{name}</span>
    </Link>
  )
}

const DisplayEmail = ({ emails }) => {
  if (!emails || !emails.length) {
    return <span className='gray60'>No email</span>
  }

  return <a href={`mailto:${emails[0].value}`}>{emails[0].value}</a>
}

const DisplayPhone = ({ phones }) => {
  if (!phones || !phones.length) {
    return <span className='gray60'>No phone</span>
  }

  return <a href={`tel:${phones[0].value}`}>{phones[0].value}</a>
}

class ContactsTable extends React.Component {
  static propTypes = {
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
    // The select all state ['include', 'all', 'exclude']
    selectionMode: PropTypes.oneOf(['include', 'all', 'exclude']),
    // Callback when select all is clicked
    onSelectionModeChange: PropTypes.func,
    // Optional campaign for calculating a contacts status
    campaign: PropTypes.object,
    // returns true while subscriptionts are still syncing data.
    loading: PropTypes.bool,
    // true if we are searching
    searchTermActive: PropTypes.bool,
    // used to stash the page state
    router: PropTypes.object
  }

  onSelectAllChange = () => {
    const { selectionMode } = this.props
    if (selectionMode === 'include') {
      this.props.onSelectionModeChange('all')
      this.props.onSelectionsChange(this.props.contacts.slice())
    } else {
      this.props.onSelectionModeChange('include')
      this.props.onSelectionsChange([])
    }
  }

  onSelectChange = (contact) => {
    let { selections, selectionMode } = this.props
    const index = selections.findIndex((c) => c._id === contact._id)

    if (index === -1) {
      selections = selections.concat([contact])
    } else {
      selections.splice(index, 1)
      selections = Array.from(selections)
    }

    this.props.onSelectionsChange(selections)

    if (selectionMode === 'all') {
      this.props.onSelectionModeChange('include')
    }
  }

  onItemClick = (e) => {
    const {location, router} = this.props
    const contactSlug = e.currentTarget.dataset.contact

    router.replace({
      pathname: location.pathname,
      query: location.query,
      state: {
        scrollPos: [0, window.scrollY],
        contactSlug
      }
    })
  }

  componentDidMount (prevProps, prevState) {
    const {location, loading} = this.props
    console.log('componentDidMount', {loading, location})
    if (!loading && location.state && location.state.scrollPos) {
      window.scrollTo.apply(window, location.state.scrollPos)
    }
  }

  render () {
    const { sort, onSortChange, contacts, selections, selectionMode, campaign, loading, searchTermActive, location } = this.props

    if (!loading && !contacts.length) {
      return <p className='p6 mt0 f-xl semibold center' data-id='contacts-table-empty'>No contacts found</p>
    }

    const selectionsById = selections.reduce((memo, selection) => {
      memo[selection._id] = selection
      return memo
    }, {})

    const activeSlug = location.state && location.state.contactSlug
    console.log('render', activeSlug)

    return (
      <div>
        <table className='table' data-id={`contacts-table${searchTermActive ? '-search-results' : '-unfiltered'}`}>
          <thead>
            <tr className='bg-gray90'>
              <th className='right-align' style={{width: 34, paddingRight: 0, borderRight: '0 none'}}>
                <Checkbox
                  checked={selectionMode === 'all'}
                  onChange={this.onSelectAllChange} />
              </th>
              <SortableHeader
                className='left-align'
                sortDirection={sort['name']}
                style={{borderLeft: '0 none'}}
                onSortChange={(d) => onSortChange({ name: d })}>
                Name
              </SortableHeader>
              <SortableHeader
                className='left-align'
                sortDirection={sort['outlets.0.value']}
                onSortChange={(d) => onSortChange({ 'outlets.0.value': d })}>
                Title
              </SortableHeader>
              <SortableHeader
                className='left-align'
                sortDirection={sort['outlets.0.label']}
                onSortChange={(d) => onSortChange({ 'outlets.0.label': d })}>
                Media Outlet
              </SortableHeader>
              <th className='left-align'>Email</th>
              <th className='left-align'>Phone</th>
              {campaign && (
                <SortableHeader
                  className='left-align'
                  sortDirection={sort['status']}
                  onSortChange={(d) => onSortChange({ status: d })}>
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
            {contacts.map((contact, index) => {
              const {
                _id,
                slug,
                emails,
                outlets,
                phones,
                updatedBy,
                createdBy,
                updatedAt,
                createdAt
              } = contact
              const contactRef = campaign ? campaign.contacts[campaign.slug] : null
              const contextualUpdatedAt = contactRef ? contactRef.updatedAt : (updatedAt || createdAt)
              const contextualUpdatedBy = contactRef ? contactRef.updatedBy : (updatedBy || createdBy)
              const firstOutlet = (outlets && outlets.length && outlets[0]) || {}
              return (
                <SelectableRow
                  data={contact}
                  active={activeSlug === slug}
                  selected={!!selectionsById[_id]}
                  onSelectChange={this.onSelectChange}
                  key={slug}
                  data-id={`contacts-table-row-${index}`}
                  data-item={slug} >
                  <td className='left-align'>
                    <ContactLink contact={contact} onClick={this.onItemClick} />
                  </td>
                  <td className='left-align'>
                    {firstOutlet.value || <span className='gray60'>No title</span>}
                  </td>
                  <td className='left-align'>
                    {firstOutlet.label || <span className='gray60'>No outlet</span>}
                  </td>
                  <td className='left-align'>
                    <DisplayEmail emails={emails} />
                  </td>
                  <td className='left-align'>
                    <DisplayPhone phones={phones} />
                  </td>
                  {campaign && (
                    <td className='left-align' style={{overflow: 'visible'}}>
                      <StatusSelectorContainer
                        buttonClassName='btn btn-no-border bg-transparent'
                        buttonStyle={{marginLeft: 0}}
                        contact={contact}
                        campaign={campaign}
                        children={(status) => <StatusLabel name={status} />}
                      />
                    </td>
                  )}
                  <td className='left-align'>
                    <TimeAgo className='semibold f-sm' date={contextualUpdatedAt} />
                    <span className='normal f-sm'> by <YouOrName user={contextualUpdatedBy} /></span>
                  </td>
                </SelectableRow>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

export default withRouter(ContactsTable)
