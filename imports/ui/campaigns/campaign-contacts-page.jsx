import React, { PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactsTable from '../contacts/contacts-table'
import SearchBox from '../lists/search-box'
import ContactsActionsToast from '../contacts/contacts-actions-toast'
import CampaignTopbar from './campaign-topbar'
import CampaignSummary from './campaign-summary'

const CampaignContactsPage = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    router: PropTypes.object
  },

  getInitialState () {
    return {
      sort: { updatedAt: -1 },
      selections: [],
      term: ''
    }
  },

  onSectorChange (selectedSector) {
    this.setState({ selectedSector })
  },

  onSortChange (sort) {
    this.setState({ sort })
  },

  onSelectionsChange (selections) {
    this.setState({ selections })
  },

  onTermChange (term) {
    this.setState({ term })
  },

  onDeselectAllClick () {
    this.setState({ selections: [] })
  },

  onBackClick () {
    const { slug } = this.props.params
    this.props.router.push(`/campaign/${slug}`)
  },

  onStatusChange ({status, contact}) {
    const post = {
      contactSlug: contact.slug,
      medialistSlug: this.props.campaign.slug,
      status
    }
    Meteor.call('posts/create', post)
  },

  render () {
    const { campaign } = this.props
    if (!campaign) return null
    const { onSortChange, onSelectionsChange, onBackClick, onStatusChange } = this
    const { sort, term, selections } = this.state
    return (
      <div>
        <CampaignTopbar campaign={campaign} backLinkText={'Campaign\'s Activity'} onBackClick={onBackClick} />
        <CampaignSummary campaign={campaign} />
        <div className='bg-white shadow-2 m4'>
          <div className='p4 flex items-center'>
            <div className='flex-auto'>
              <SearchBox onTermChange={this.onTermChange} placeholder='Search contacts...' />
            </div>
            <div className='flex-none pl4 f-xs'>
              <ContactsTotalContainer />
            </div>
          </div>
          <ContactsTableContainer
            sort={sort}
            term={term}
            campaign={campaign}
            selections={selections}
            onSortChange={onSortChange}
            onSelectionsChange={onSelectionsChange}
            onStatusChange={onStatusChange} />
        </div>
        <ContactsActionsToast
          contacts={selections}
          onCampaignClick={() => console.log('TODO: add contacts to campaign')}
          onSectorClick={() => console.log('TODO: add/edit sectors')}
          onFavouriteClick={() => console.log('TODO: toggle favourite')}
          onTagClick={() => console.log('TODO: add/edit tags')}
          onDeleteClick={() => console.log('TODO: delete contact(s)')}
          onDeselectAllClick={this.onDeselectAllClick} />
      </div>
    )
  }
})

const ContactsTotal = ({ total }) => (
  <div>{total} contact{total === 1 ? '' : 's'} total</div>
)

const ContactsTotalContainer = createContainer((props) => {
  return { ...props, total: window.Contacts.find({}).count() }
}, ContactsTotal)

const ContactsTableContainer = createContainer((props) => {
  const query = {}

  if (props.term) {
    const filterRegExp = new RegExp(props.term, 'gi')
    query.$or = [
      { name: filterRegExp },
      { jobTitles: filterRegExp },
      { primaryOutlets: filterRegExp }
    ]
  }

  const contacts = window.Contacts.find(query, { sort: props.sort }).fetch()
  return { ...props, contacts }
}, ContactsTable)

export default createContainer((props) => {
  const { slug } = props.params
  Meteor.subscribe('medialist', slug)
  Meteor.subscribe('contacts-by-campaign', slug)
  const campaign = window.Medialists.findOne({ slug })
  return { ...props, campaign }
}, withRouter(CampaignContactsPage))
