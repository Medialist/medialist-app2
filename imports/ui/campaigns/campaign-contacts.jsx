import React, { PropTypes } from 'react'
import CampaignContact from './campaign-contact'
import StatusLabel from '../feedback/status-label'

const CampaignContacts = ({campaign, contacts, onSelectContact}) => {
  if (!contacts) return null
  return (
    <div>
      {contacts.map((contact) => {
        const { slug } = contact
        const status = campaign.contacts[slug]
        return (
          <div
            className={'flex items-center pointer border-bottom border-top border-transparent hover-border-gray80 pl4 hover-bg-gray90 hover-opacity-trigger active-bg-green-light'}
            style={{height: 75}}
            onClick={() => onSelectContact(contact)}
            key={slug} >
            <div className='flex-none'>
              <CampaignContact contact={contact} />
            </div>
            <div className='flex-none' style={{paddingLeft: 120}}>
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
