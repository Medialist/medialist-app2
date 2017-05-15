import React from 'react'
import PropTypes from 'prop-types'
import { CircleAvatar } from '../images/avatar'
import StatusSelectorContainer from '../feedback/status-selector-container'
import StatusDot from '../feedback/status-dot'

const CampaignContact = ({ contact, campaign, style, highlighted, ...props }) => {
  return (
    <div style={{lineHeight: 1.3, ...style}} {...props}>
      <CircleAvatar className='inline-block' size={38} avatar={contact.avatar} name={contact.name} />
      <div className='inline-block align-top pl3' style={{width: 220, height: 55}}>
        <div className='flex items-center'>
          <div className={`flex-none f-md semibold ${highlighted ? 'blue' : ''}`}>{contact.name}</div>
          <div className='flex-none'>
            {campaign && (
              <StatusSelectorContainer
                contactSlug={contact.slug}
                campaign={campaign}
                style={{marginLeft: 7}}
                children={(status) => <StatusDot size={10} name={status} />}
              />
            )}
          </div>
        </div>
        <div className='f-sm normal gray20 truncate'>{(contact.outlets && contact.outlets.length) ? contact.outlets[0].value : null}</div>
        <div className='f-sm normal gray40 truncate'>{contact.outlets.map((o) => o.label).join(', ')}</div>
      </div>
    </div>
  )
}

CampaignContact.propTypes = {
  contact: PropTypes.object.isRequired,
  campaign: PropTypes.object
}

export default CampaignContact
