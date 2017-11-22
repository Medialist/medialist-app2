import React from 'react'
import CampaignPreview from '/imports/ui/campaigns/campaign-preview'
import StatusLabel from '/imports/ui/feedback/status-label'

export default ({campaign, contact}) => {
  let status = null

  if (contact && campaign.contacts) {
    const campaignContact = campaign.contacts.find(c => c.slug === contact.slug)
    if (campaignContact) {
      status = campaignContact.status
    }
  }

  return (
    <div className='flex items-center'>
      <div className='flex-auto pr3'>
        <CampaignPreview {...campaign} />
      </div>
      { !status ? null : (
        <div className='flex-none' style={{width: 173}}>
          <Status name={status} />
        </div>
      )}
    </div>
  )
}

const Status = ({ name }) => {
  if (!name) {
    return null
  }

  return <StatusLabel name={name} />
}
