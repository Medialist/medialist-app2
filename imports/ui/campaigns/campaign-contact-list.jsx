import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import CampaignContact from './campaign-contact'

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
      <aside className='bg-white mb4 shadow-2'>
        <header className='border-gray80 border-bottom'>
          <Link className='block pt5 pb4 px4' to={`/campaign/${campaign.slug}/contacts`}>
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
    <a href='#' onClick={onAddContactClick} className='block py5 bg-white blue semibold underline'>
      Add Contacts to this Campaign
    </a>
  </div>
)

const ContactsList = ({contacts, campaign}) => (
  <div>
    <div className='px4 pb3'>
      {contacts.map((contact) => (
        <CampaignContact key={contact.slug} contact={contact} campaign={campaign} />
      ))}
    </div>
    <footer className='center border-gray80 border-top p4'>
      <Link to={`/campaign/${campaign.slug}/contacts`} className='block blue'>Show all</Link>
    </footer>
  </div>
)

export default CampaignContactList
