import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Modal from '../navigation/modal'
import { SearchBlueIcon, AddIcon } from '../images/icons'
import createSearchContainer from '../campaigns/campaign-search-container'
import { SquareAvatar } from '../images/avatar'
import { TimeFromNow } from '../time/time'
import withSnackbar from '../snackbar/with-snackbar'
import { addContactsToCampaign } from '/imports/api/contacts/methods'

const AddContactsToCampaigns = createSearchContainer(React.createClass({
  propTypes: {
    title: PropTypes.string,
    term: PropTypes.string,
    onTermChange: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    campaigns: PropTypes.array.isRequired,
    children: PropTypes.node
  },

  onChange (e) {
    this.props.onTermChange(e.target.value)
  },

  onKeyPress (e) {
    if (e.key !== 'Enter') return
    const { campaigns, onAdd } = this.props
    if (!campaigns[0]) return
    onAdd(campaigns[0])
  },

  render () {
    const {
      title,
      term,
      campaigns,
      onAdd,
      children
    } = this.props

    const { onChange, onKeyPress } = this

    return (
      <div data-id='add-contacts-to-campaign-form'>
        <div className='f-xl regular center mt6'>{title}</div>
        <div className='mb6'>{children}</div>
        <div className='py3 pl4 flex border-top border-bottom border-gray80'>
          <SearchBlueIcon className='flex-none' />
          <input ref={(input) => input && input.focus()} className='flex-auto f-sm pa2 mx2' placeholder='Search campaigns' onChange={onChange} style={{outline: 'none'}} onKeyPress={onKeyPress} value={term} data-id='add-contacts-to-campaign-search-input' />
        </div>
        <div style={{height: '413px', overflowY: 'auto'}}>
          <ResultList onAdd={onAdd} results={campaigns} searching={Boolean(term)} />
        </div>
      </div>
    )
  }
}))

const AddContactsToCampaignsContainer = withSnackbar(React.createClass({
  propTypes: {
    onDismiss: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    snackbar: PropTypes.object.isRequired
  },

  getInitialState () {
    return { term: '' }
  },

  onAdd (item) {
    const {contacts, onDismiss} = this.props
    const contactSlugs = contacts.map((c) => c.slug)
    const campaignSlug = item.slug
    addContactsToCampaign.call({contactSlugs, campaignSlug}, (error) => {
      if (error) {
        console.log(error)
        return this.props.snackbar.error('batch-add-contacts-to-campaign-success')
      }

      onDismiss()

      return this.props.snackbar.show((
        <div>
          <span>Added {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'} to </span>
          <Link to={`/campaign/${item.slug}`} className='underline semibold'>
            {item.name}
          </Link>
        </div>
      ), 'batch-add-contacts-to-campaign-success')
    })
  },

  onTermChange (term) {
    this.setState({ term })
  },

  render () {
    const {
      onTermChange,
      onAdd
    } = this
    const { term } = this.state
    return (
      <AddContactsToCampaigns
        {...this.props}
        term={term}
        onTermChange={onTermChange}
        onAdd={onAdd} />
    )
  }
}))

export default Modal(AddContactsToCampaignsContainer)

const CampaignResult = (props) => {
  const {style, avatar, name, client, updatedAt} = props
  return (
    <div style={{lineHeight: 1.3, ...style}}>
      <SquareAvatar size={38} avatar={avatar} name={name} />
      <div className='inline-block align-top pl3' style={{width: 220}}>
        <div className='f-md semibold gray10 truncate' data-id='campaign-name'>{name}</div>
        <div className='f-sm normal nowrap'>
          {client && (
            <span>
              <span className='gray20 truncate' data-id='client-name'>{client.name}</span>
              <span> &mdash; </span>
            </span>
          )}
          <TimeFromNow className='gray40' date={updatedAt} data-id='updated-time' />
        </div>
      </div>
    </div>
  )
}

const ResultList = React.createClass({
  propTypes: {
    onAdd: PropTypes.func.isRequired,
    results: PropTypes.array.isRequired,
    searching: PropTypes.bool
  },

  render () {
    const { results, onAdd } = this.props

    return (
      <div data-id={`campaign-list${this.props.searching ? '-search-results' : ''}`}>
        {results.map((res) => {
          const {slug, contacts} = res
          const contactCount = Object.keys(contacts).length
          return (
            <div
              className='flex items-center pointer border-bottom border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger hover-color-trigger'
              key={slug}
              onClick={() => onAdd(res)}>
              <div className='flex-auto'>
                <CampaignResult {...res} />
              </div>
              <div className='flex-none f-sm gray40 hover-gray20' data-id='contact-count'>
                {contactCount} {contactCount === 1 ? 'contact' : 'contacts'}
              </div>
              <div className='flex-none opacity-0 hover-opacity-100' style={{padding: '0 50px'}}>
                <AddIcon data-id='add-button' />
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})
