import React from 'react'
import PropTypes from 'prop-types'
import CampaignContact from '/imports/ui/campaigns/campaign-contact'
import StatusLabel from '/imports/ui/feedback/status-label'

const CampaignContacts = ({campaign, contacts, onSelectContact}) => {
  if (!contacts) {
    return null
  }

  return (
    <div>
      {contacts.map((contact) => {
        const { slug, status } = contact
        return (
          <div
            className={'flex items-center pointer border-bottom border-top border-transparent hover-border-gray80 pl4 hover-bg-gray90 hover-opacity-trigger active-bg-green-light'}
            style={{height: 75}}
            onClick={() => onSelectContact(contact)}
            key={slug}
            data-type='campaign-contact-search-result'
            data-id={`campaign-contact-${contact.slug}`} >
            <div className='flex-auto'>
              <CampaignContact contact={contact} />
            </div>
            <div className='flex-none' style={{width: 170}}>
              <StatusLabel name={status} />
            </div>
          </div>)
      })}
    </div>
  )
}

CampaignContacts.PropTypes = {
  campaign: PropTypes.object.isRequired,
  contacts: PropTypes.array.isRequired,
  onSelectContact: PropTypes.func
}

export default CampaignContacts
