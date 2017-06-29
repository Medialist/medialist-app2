import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import Modal from '/imports/ui/navigation/modal'
import { AddIcon, SelectedIcon } from '/imports/ui/images/icons'
import CampaignPreview from '/imports/ui/campaigns/campaign-preview'
import createSearchContainer from '/imports/ui/campaigns/campaign-search-container'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { addContactsToCampaign } from '/imports/api/contacts/methods'
import { BLUE } from '/imports/ui/colours'
import SearchBox from '/imports/ui/lists/search-box'

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

  onTermChange (term) {
    this.props.onTermChange(term)
  },

  onKeyPress (e) {
    if (e.key !== 'Enter') {
      return
    }

    const { campaigns, onAdd } = this.props

    if (!campaigns[0]) {
      return
    }

    onAdd(campaigns[0])
  },

  render () {
    const {
      title,
      term,
      campaigns,
      onAdd,
      children,
      contacts
    } = this.props

    return (
      <div data-id='add-contacts-to-campaign-form'>
        <div className='f-xl regular center mt6'>{title}</div>
        <div className='mb6'>{children}</div>
        <SearchBox
          onTermChange={this.onTermChange}
          onKeyDown={this.onKeyPress}
          placeholder='Search campaigns'
          data-id='search-input' />
        <div style={{height: '413px', overflowY: 'auto'}}>
          <ResultList onAdd={onAdd} results={campaigns} searching={Boolean(term)} contacts={contacts} alreadyInCampaignFilter={Boolean(children)} />
        </div>
      </div>
    )
  }
}))

const AddContactsToCampaignsContainer = withSnackbar(React.createClass({
  propTypes: {
    onDismiss: PropTypes.func.isRequired,
    contacts: PropTypes.array.isRequired,
    snackbar: PropTypes.object.isRequired,
    onContactPage: PropTypes.bool
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

      let name

      if (contacts.length === 1) {
        const contact = contacts[0]

        if (this.props.onContactPage) {
          name = contact.name.split(' ')[0]
        } else {
          name = (
            <Link to={`/contact/${contact.slug}`} className='underline semibold'>
              {contact.name}
            </Link>
          )
        }
      } else {
        name = `${contacts.length} contacts`
      }

      return this.props.snackbar.show((
        <div>
          <span>Added {name} to </span>
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

export default Modal(AddContactsToCampaignsContainer, {
  'data-id': 'campaign-selector-modal'
})

const CanJoinCampaignResult = (props) => {
  const {onAdd, ...res} = props
  const contactCount = Object.keys(res.contacts).length
  return (
    <div
      className='flex items-center pointer border-bottom border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger hover-color-trigger'
      key={res.slug}
      onClick={() => onAdd(res)}
      data-slug={`campaign-slug-${res.slug}`}>
      <div className='flex-auto'>
        <CampaignPreview {...res} />
      </div>
      <div className='flex-none f-sm gray40 hover-gray20 px4' data-id='contact-count'>
        {contactCount} {contactCount === 1 ? 'contact' : 'contacts'}
      </div>
      <div className='flex-none opacity-0 hover-opacity-100 px4'>
        <AddIcon data-id='add-button' style={{fill: BLUE}} />
      </div>
    </div>
  )
}

const CanNotJoinCampaignResult = (props) => {
  return (
    <div className='border-bottom border-gray80' data-slug={`campaign-slug-${props.slug}`}>
      <div className='flex items-center py2 pl4 opacity-50' key={props.slug}>
        <div className='flex-auto'>
          <CampaignPreview {...props} />
        </div>
        <div className='flex-none px4 f-sm gray40'>
          Already in campaign
        </div>
        <div className='flex-none px4'>
          <SelectedIcon style={{fill: BLUE}} />
        </div>
      </div>
    </div>
  )
}

const ResultList = React.createClass({
  propTypes: {
    onAdd: PropTypes.func.isRequired,
    results: PropTypes.array.isRequired,
    searching: PropTypes.bool,
    contacts: PropTypes.array.isRequired,
    alreadyInCampaignFilter: PropTypes.bool.isRequired
  },

  render () {
    const { results, onAdd, contacts, alreadyInCampaignFilter } = this.props
    const contactSlugs = contacts.map((c) => c.slug)

    return (
      <div data-id={`${this.props.searching ? 'search-results' : 'unfiltered'}`}>
        {results.map((res) => {
          if (alreadyInCampaignFilter) return <CanJoinCampaignResult {...res} onAdd={onAdd} key={res._id} />
          const alreadyInCampaign = contactSlugs.some((c) => res.contacts[c])
          const ResultListItem = alreadyInCampaign ? CanNotJoinCampaignResult : CanJoinCampaignResult
          return <ResultListItem {...res} onAdd={onAdd} key={res._id} />
        })}
      </div>
    )
  }
})
