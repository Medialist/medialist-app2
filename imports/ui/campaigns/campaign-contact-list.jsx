import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import CampaignContact from '/imports/ui/campaigns/campaign-contact'

const CampaignContactList = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    contacts: PropTypes.array,
    contactsCount: PropTypes.number,
    onAddContactClick: PropTypes.func.isRequired
  },

  render () {
    const { contacts, campaign, contactsCount, onAddContactClick } = this.props
    if (!contacts || !campaign) return null

    return (
      <aside className='bg-white mb4 shadow-2' data-id='campaign-contact-list'>
        <header className='border-gray80 border-bottom'>
          <Link className='block pt5 pb4 px4' to={`/campaign/${campaign.slug}/contacts`} data-id='manage-contacts'>
            <span className='f-sm blue right'>Manage</span>
            <span className='pill semibold f-xs bg-blue' style={{paddingTop: 1}}>{contactsCount}</span>
            <span className='f-md semibold gray20 ml1'>Contacts</span>
          </Link>
        </header>
        { contacts.length ? (
          <ContactsList contacts={contacts} campaign={campaign} />
        ) : (
          <EmptyContactsList onAddContactClick={onAddContactClick} />
        )}
      </aside>
    )
  }
})

const EmptyContactsList = ({onAddContactClick}) => (
  <div className='px4'>
    <a href='#' onClick={onAddContactClick} className='block py5 bg-white blue semibold underline' data-id='add-contacts-to-campaign-button'>
      Add Contacts to this Campaign
    </a>
  </div>
)

const ContactsList = ({contacts, campaign}) => (
  <div>
    <div className='px4 pb3'>
      {contacts.map((contact) => (
        <Link to={`/contact/${contact.slug}`} className='block pt3' key={contact._id}>
          <CampaignContact
            key={contact.slug}
            contact={contact}
            campaign={campaign}
            statusSelectorDropdown={{
              left: -150,
              arrowAlign: 'right',
              arrowMarginRight: '30px'
            }} />
        </Link>
      ))}
    </div>
    <footer className='center border-gray80 border-top p4'>
      <Link to={`/campaign/${campaign.slug}/contacts`} className='block blue' data-id='show-all-contacts-button'>Show all</Link>
    </footer>
  </div>
)

export default CampaignContactList
