import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import SortableHeader from '../tables/sortable-header'
import SelectableRow from '../tables/selectable-row'
import Checkbox from '../tables/checkbox'
import { TimeFromNow } from '../time/time'
import YouOrName from '../users/you-or-name'
import { CircleAvatar } from '../images/avatar'
import isSameItems from '../lists/is-same-items'
import StatusLabel from '../feedback/status-label'
import StatusSelectorContainer from '../feedback/status-selector-container'
import SearchBox from '../lists/search-box'
import Contacts from '/imports/api/contacts/contacts'

const ContactLink = ({contact, campaign}) => {
  const {slug, name, avatar} = contact
  const contactUrl = `/contact/${slug}`
  const campaignUrl = campaign ? `/campaign/${campaign.slug}` : ''
  const to = campaignUrl + contactUrl
  return (
    <Link to={to} className='nowrap' data-id='contact-link'>
      <CircleAvatar avatar={avatar} name={name} />
      <span className='ml3 semibold'>{name}</span>
    </Link>
  )
}

const ContactsTotal = ({ total }) => (
  <div>{total} contact{total === 1 ? '' : 's'} total</div>
)

const ContactsTable = React.createClass({
  propTypes: {
    // Return search query used to load contacts
    query: PropTypes.func.isRequired,
    // Return the total number of items
    total: PropTypes.number.isRequired,
    // Callback when selection changes
    onSelectionChange: PropTypes.func.isRequired,
    // Optional campaign for calculating a contacts status
    campaign: PropTypes.object
  },

  getInitialState () {
    return {
      loading: false,
      searching: false,
      selections: [],
      term: '',
      sort: { updatedAt: -1 },
      filter: () => true
    }
  },

  setFilter (filter) {
    this.setState({
      filter: filter
    })
  },

  onSelectAllChange () {
    let selections

    if (isSameItems(this.state.selections, this.state.contacts)) {
      selections = []
    } else {
      selections = this.state.contacts.slice()
    }

    this.setState({
      selections: selections
    })

    this.props.onSelectionChange(selections)
  },

  onSelectChange (contact) {
    let { selections } = this.state
    const index = selections.findIndex((c) => c._id === contact._id)

    if (index === -1) {
      selections = selections.concat([contact])
    } else {
      selections.splice(index, 1)
      selections = Array.from(selections)
    }

    this.setState({
      selections: selections
    })

    this.props.onSelectionChange(selections)
  },

  onTermChange (term) {
    this.setState({
      term
    })

    try {
      this.setState({
        contacts: this.props.contacts(term, this.state.sort)
      })
    } catch (error) {
      // ?!
    }
  },

  onSortChange (sort) {
    this.setState({ sort })
  },

  render () {
    const contacts = Contacts.find(this.props.query(this.state.term), {
      sort: this.state.sort
    })
      .fetch()
      .filter(this.state.filter)

    const selectionsById = this.state.selections.reduce((memo, selection) => {
      memo[selection._id] = selection
      return memo
    }, {})

    return (
      <div className='bg-white shadow-2 m4' data-id='contacts-table'>
        <div className='p4 flex items-center'>
          <div className='flex-auto'>
            <SearchBox onTermChange={this.onTermChange} placeholder='Search contacts...' data-id='search-contacts-input'>
              <div style={{marginBottom: -4}} >
                {this.props.campaigns && campaigns.map((c) => (
                  <AvatarTag
                    key={c.slug}
                    name={c.name}
                    avatar={c.avatar}
                    onRemove={() => onCampaignRemove(c)}
                  />
                ))}
                {this.props.selectedTags && selectedTags.map((t) => (
                  <CountTag
                    key={t.slug}
                    name={t.name}
                    count={t.contactsCount}
                    onRemove={() => onTagRemove(t)}
                  />
                ))}
              </div>
            </SearchBox>
          </div>
          <div className='flex-none pl4 f-xs'>
            <ContactsTotal total={this.props.total} />
          </div>
        </div>
        {contacts.length ?
          <table className='table' data-id={`contacts-table${this.state.term ? '-search-results' : '-unfiltered'}`}>
            <thead>
              <tr className='bg-gray90'>
                <th className='right-align' style={{width: 34, paddingRight: 0, borderRight: '0 none'}}>
                  <Checkbox
                    checked={isSameItems(this.state.selections, contacts)}
                    onChange={this.onSelectAllChange} />
                </th>
                <SortableHeader
                  className='left-align'
                  sortDirection={this.state.sort['name']}
                  style={{borderLeft: '0 none'}}
                  onSortChange={(d) => this.onSortChange({ name: d })}>
                  Name
                </SortableHeader>
                <SortableHeader
                  className='left-align'
                  sortDirection={this.state.sort['outlets.value']}
                  onSortChange={(d) => this.onSortChange({ 'outlets.value': d })}>
                  Title
                </SortableHeader>
                <SortableHeader
                  className='left-align'
                  sortDirection={this.state.sort['outlets.label']}
                  onSortChange={(d) => this.onSortChange({ 'outlets.label': d })}>
                  Media Outlet
                </SortableHeader>
                <th className='left-align'>Email</th>
                <th className='left-align'>Phone</th>
                {this.props.campaign && (
                  <SortableHeader
                    className='left-align'
                    sortDirection={this.state.sort['status']}
                    onSortChange={(d) => this.onSortChange({ status: d })}>
                    Status
                  </SortableHeader>
                )}
                <SortableHeader
                  className='left-align'
                  sortDirection={this.state.sort['updatedAt']}
                  onSortChange={(d) => this.onSortChange({ updatedAt: d })}>
                  Updated
                </SortableHeader>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => {
                const {
                  _id,
                  emails,
                  outlets,
                  phones,
                  updatedAt,
                  updatedBy
                } = contact
                return (
                  <SelectableRow data={contact} selected={!!selectionsById[_id]} onSelectChange={this.onSelectChange} key={_id} data-id={`contacts-table-row-${index}`}>
                    <td className='left-align'>
                      <ContactLink contact={contact} campaign={this.props.campaign} />
                    </td>
                    <td className='left-align'>{(outlets && outlets.length) ? outlets[0].value : null}</td>
                    <td className='left-align'>{(outlets && outlets.length) ? outlets[0].label : null}</td>
                    <td className='left-align'>
                      <DisplayEmail emails={emails} />
                    </td>
                    <td className='left-align'>
                      <DisplayPhone phones={phones} />
                    </td>
                    {this.props.campaign && (
                      <td className='left-align' style={{overflow: 'visible'}}>
                        <StatusSelectorContainer
                          contactSlug={contact.slug}
                          campaign={this.props.campaign}
                          children={(status) => <StatusLabel name={status} />}
                        />
                      </td>
                    )}
                    <td className='left-align'>
                      <TimeFromNow className='semibold f-sm' date={updatedAt} />
                      <span className='normal f-sm'> by <YouOrName user={updatedBy} /></span>
                    </td>
                  </SelectableRow>
                )
              })}
            </tbody>
          </table> : <p className='pt2 pb5 mt0 f-xl semibold center'>No contacts found</p> }
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
