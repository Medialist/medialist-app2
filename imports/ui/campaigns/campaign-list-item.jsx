import React from 'react'
import CampaignPreview from '/imports/ui/campaigns/campaign-preview'
import StatusLabel from '/imports/ui/feedback/status-label'

export default ({campaign, contact}) => {
  const status = contact ? contact.status : null

  return (
    <div className='flex items-center justify-end'>
      <div className='flex-auto pr3'>
        <CampaignPreview {...campaign} />
      </div>
      <div className='flex-none' style={{width: 173}}>
        <Status name={status} />
      </div>
    </div>
  )
}

const Status = ({ name }) => {
  if (!name) {
    return null
  }

  return <StatusLabel name={name} />
}
