import React from 'react'
import { AddIcon, SelectedIcon } from '/imports/ui/images/icons'
import CampaignPreview from '/imports/ui/campaigns/campaign-preview'
import { BLUE } from '/imports/ui/colours'

export const CanJoinCampaignResult = (props) => {
  const {onSelected, ...res} = props
  const contactCount = Object.keys(res.contacts).length
  return (
    <div
      className='flex items-center pointer border-bottom border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger hover-color-trigger'
      key={res.slug}
      onClick={() => onSelected(res)}
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

export const CanNotJoinCampaignResult = (props) => {
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
