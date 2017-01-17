import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { CircleAvatar } from '../images/avatar'
import StatusDot from '../feedback/status-dot'

const CampaignContact = ({ contact, campaign }) => {
  const status = campaign.contacts && campaign.contacts[contact.slug]
  return (
    <div className='pt3' style={{lineHeight: 1.3}}>
      <Link to={`contact/${contact.slug}`}>
        <CircleAvatar className='inline-block' size={38} avatar={contact.avatar} name={contact.name} />
        <div className='inline-block align-top pl3' style={{width: 220, height: 55}}>
          <div className='f-md semibold gray10 truncate'>
            {contact.name}
            <StatusDot name={status} className='ml1' />
          </div>
          <div className='f-sm normal gray20 truncate'>{(contact.outlets && contact.outlets.length) ? contact.outlets[0].value : null}</div>
          <div className='f-sm normal gray40 truncate'>{contact.outlets.map((o) => o.label).join(', ')}</div>
        </div>
      </Link>
    </div>
  )
}

CampaignContact.propTypes = {
  contact: PropTypes.object.isRequired,
  campaign: PropTypes.object.isRequired
}

export default CampaignContact
