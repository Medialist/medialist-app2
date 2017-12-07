import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import replaceUrl from '/imports/lib/replace-url'
import SortableHeader from '/imports/ui/tables/sortable-header'
import SelectableRow from '/imports/ui/tables/selectable-row'
import Checkbox from '/imports/ui/tables/checkbox'
import { TimeAgo } from '/imports/ui/time/time'
import YouOrName from '/imports/ui/users/you-or-name'
import { CircleAvatar } from '/imports/ui/images/avatar'
import StatusLabel from '/imports/ui/feedback/status-label'
import StatusSelectorContainer from '/imports/ui/feedback/status-selector-container'
import PostIcon from '/imports/ui/posts/post-icon'
import Status from '/imports/ui/feedback/status'
import UserSelector from '/imports/ui/users/user-selector'

const ContactLink = ({contact, onClick}) => {
  const {slug, name, avatar} = contact
  return (
    <Link onClick={onClick} to={`/contact/${slug}`} className='nowrap' data-id='contact-link' data-contact={slug}>
      <CircleAvatar avatar={avatar} name={name} />
      <span className='ml3 semibold gray10'>{name}</span>
    </Link>
  )
}

const DisplayOutlet = ({outlets}) => {
  const firstOutlet = (outlets && outlets.length && outlets[0]) || {}
  return (
    <div>
      {firstOutlet.label ? (
        <div className='f-sm gray10 lh-copy truncate'>{firstOutlet.label}</div>
      ) : (
        <div className='f-sm gray60'>No outlet</div>
      )}
      {firstOutlet.value ? (
        <div className='f-xs gray10 truncate'>{firstOutlet.value}</div>
      ) : null }
      {!firstOutlet.value && firstOutlet.label ? (
        <div className='f-xs gray60'>No title</div>
      ) : null }
    </div>
  )
}

const DisplayEmail = ({ emails }) => {
  if (!emails || !emails.length) {
    return <span className='gray60'>No email</span>
  }
  return <a className='gray10' href={`mailto:${emails[0].value}`}>{emails[0].value}</a>
}

const DisplayPhone = ({ phones }) => {
  if (!phones || !phones.length) {
    return <span className='gray60'>No phone</span>
  }
  return <a className='gray10' href={`tel:${phones[0].value}`}>{phones[0].value}</a>
}

const UpdatedAt = ({contact}) => {
  const {createdAt, createdBy, updatedAt, updatedBy} = contact
  return (
    <div>
      <div className='gray20 truncate'>
        <TimeAgo date={(updatedAt || createdAt)} /> by <YouOrName user={(updatedBy || createdBy)} />
      </div>
    </div>
  )
}

const LatestActivity = ({contact}) => {
  const post = contact.latestPost ? contact.latestPost : {
    type: 'AddContactsToCampaign',
    message: 'Contact added to the campaign',
    createdAt: contact.updatedAt,
    createdBy: contact.updatedBy
  }
  const {type, status, createdBy, createdAt} = post
  return (
    <div className='flex'>
      <div className='flex-none pr2' style={{paddingTop: 3}}>
        <PostIcon type={type} />
      </div>
      <div className='flex-auto'>
        <div className='truncate f-sm gray10 semibold lh-copy'>
          {formatMessage(post)}
          {type === 'StatusUpdate' ? <Status status={status} /> : null}
        </div>
        <div className='f-xs gray20 truncate'>
          <TimeAgo date={createdAt} /> by <YouOrName user={createdBy} />
        </div>
      </div>
    </div>
  )
}

const Owner = ({campaign, contact}) => {
  const owners = contact.owners || []
  const owner = owners[0]
  return (
    <UserSelector
      initialItems={campaign.team}
      selectedUser={owner}
      button={u => u ? (
        <CircleAvatar avatar={u.avatar} name={u.name} />
      ) : (
        <span className='gray60'>No owner</span>
      )}
      onSelect={user => {
        console.log({campaign, contact, user})
      }}
     />
  )
}

// Replace things in the message to make the preview look nice.
function formatMessage (post) {
  if (post.type === 'StatusUpdate') return 'Status updated'
  if (post.embeds && post.embeds.length) {
    return replaceUrl(post.message)
  }
  return post.message
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
    // Called before navigating to the contact profile
    onContactClick: PropTypes.func,
    // Draw the user attention to this contact
    highlightSlug: PropTypes.string
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

  render () {
    const {
      sort,
      onSortChange,
      contacts,
      selections,
      selectionMode,
      campaign,
      loading,
      searchTermActive,
      highlightSlug,
      onContactClick
     } = this.props

    if (!loading && !contacts.length) {
      return <p className='p6 mt0 f-xl semibold center' data-id='contacts-table-empty'>No contacts found</p>
    }

    const selectionsById = selections.reduce((memo, selection) => {
      memo[selection._id] = selection
      return memo
    }, {})

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
                data-id='sort-by-name'
                data-dir={sort['name'] || 0}
                className='left-align'
                sortDirection={sort['name']}
                style={{borderLeft: '0 none'}}
                onSortChange={(d) => onSortChange({ name: d })}>
                Name
              </SortableHeader>
              <SortableHeader
                className='left-align'
                sortDirection={sort['outlets.0.label']}
                onSortChange={(d) => onSortChange({ 'outlets.0.label': d })}>
                Outlet
              </SortableHeader>
              {!campaign && <th className='left-align'>Email</th> }
              {!campaign && <th className='left-align'>Phone</th> }
              {campaign && (
                <SortableHeader
                  className='left-align'
                  sortDirection={sort['status']}
                  onSortChange={(d) => onSortChange({ status: d })}>
                  Status
                </SortableHeader>
              )}
              {campaign ? (
                <SortableHeader
                  className='left-align'
                  style={{width: '40%'}}
                  sortDirection={sort['updatedAt']}
                  onSortChange={(d) => onSortChange({ updatedAt: d })}>
                   Latest Activity
                </SortableHeader>
              ) : (
                <SortableHeader
                  className='left-align'
                  sortDirection={sort['updatedAt']}
                  onSortChange={(d) => onSortChange({ updatedAt: d })}>
                   Updated At
                </SortableHeader>
              )}
              {campaign ? (
                <SortableHeader
                  className='left-align'
                  sortDirection={sort['owners.0.name']}
                  onSortChange={(d) => onSortChange({ 'owners.0.name': d })}>
                   Owner
                </SortableHeader>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact, index) => {
              const {
                _id,
                slug,
                emails,
                outlets,
                phones
              } = contact
              return (
                <SelectableRow
                  data={contact}
                  highlight={slug === highlightSlug}
                  selected={!!selectionsById[_id]}
                  onSelectChange={this.onSelectChange}
                  key={slug}
                  data-id={`contacts-table-row-${index}`}
                  data-item={slug} >
                  <td className='left-align'>
                    <ContactLink contact={contact} onClick={onContactClick} />
                  </td>
                  <td className='left-align'>
                    <DisplayOutlet outlets={outlets} />
                  </td>
                  {!campaign && (
                    <td className='left-align'>
                      <DisplayEmail emails={emails} />
                    </td>
                  )}
                  {!campaign && (
                    <td className='left-align'>
                      <DisplayPhone phones={phones} />
                    </td>
                  )}
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
                    {campaign ? (
                      <LatestActivity contact={contact} />
                    ) : (
                      <UpdatedAt contact={contact} />
                    )}
                  </td>
                  {campaign && (
                    <td className='left-align' style={{overflow: 'visible'}}>
                      <Owner campaign={campaign} contact={contact} />
                    </td>
                  )}
                </SelectableRow>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}

export default ContactsTable
