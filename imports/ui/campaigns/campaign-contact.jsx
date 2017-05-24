import React from 'react'
import PropTypes from 'prop-types'
import { CircleAvatar } from '/imports/ui/images/avatar'
import StatusSelectorContainer from '/imports/ui/feedback/status-selector-container'
import StatusDot from '/imports/ui/feedback/status-dot'

const CampaignContact = ({ contact, campaign, style, highlighted, statusSelectorDropdown, ...props }) => {
  return (
    <div className='flex' style={{lineHeight: 1.3, ...style}} {...props}>
      <CircleAvatar className='inline-block flex-none' size={38} avatar={contact.avatar} name={contact.name} />
      <div className='inline-block align-top pl3 flex-auto'>
        <div>
          <div className={`inline-block f-md semibold ${highlighted ? 'blue' : ''}`}>{contact.name}</div>
          {campaign && (
            <StatusSelectorContainer
              buttonClassName='btn btn-no-border bg-transparent'
              contactSlug={contact.slug}
              campaign={campaign}
              style={{marginLeft: 7}}
              children={(status) => <StatusDot size={10} name={status} />}
              compact
              dropdown={statusSelectorDropdown}
            />
          )}
        </div>
        <div className='f-sm normal gray20 truncate'>{(contact.outlets && contact.outlets.length) ? contact.outlets[0].value : null}</div>
        <div className='f-sm normal gray40 truncate'>{contact.outlets.map((o) => o.label).join(', ')}</div>
      </div>
    </div>
  )
}

CampaignContact.propTypes = {
  contact: PropTypes.object.isRequired,
  campaign: PropTypes.object,
  statusSelectorDropdown: PropTypes.object
}

export default CampaignContact
