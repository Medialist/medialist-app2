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
            <span className='pill f-xs bg-blue'>{contactsCount}</span>
            <span className='f-md semibold gray20 ml2'>Contacts</span>
          </Link>
        </header>
        <List contacts={contacts} onAddContactClick={onAddContactClick} />
        <footer className='center border-gray80 border-top p4'>
          <Link to={`/campaign/${campaign.slug}/contacts`} className='block blue'>Show all</Link>
        </footer>
      </aside>
    )
  }
})

const List = ({ contacts, onAddContactClick }) => {
  if (!contacts.length) {
    return (
      <div className='px4'>
        <a href='#' onClick={onAddContactClick} className='block py3 bg-white blue bold'>
          Add Contacts to this Campaign
        </a>
      </div>
    )
  }

  return (
    <div className='px4 pb3'>
      {contacts.map((contact) => (
        <CampaignContact key={contact.slug} {...contact} />
      ))}
    </div>
  )
}

export default CampaignContactList
