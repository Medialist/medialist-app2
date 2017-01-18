import React, { PropTypes } from 'react'
import { CircleAvatar } from '../images/avatar'
import StatusLabel from '../feedback/status-label'

function truncate (str, chars) {
  if (str.length <= chars) return str
  return str.substring(0, chars) + '...'
}

const CampaignContacts = (props) => {
  const {
    campaign,
    contacts,
    onSelectContact
  } = props
  return (
    <div>
      {contacts.map((contact) => {
        const {
          slug,
          avatar,
          name,
          outlets
        } = contact
        const status = campaign.contacts[slug]
        return (
          <div onClick={() => onSelectContact(contact)} className={`flex items-center pointer border-top border-gray80 py2 pl4 hover-bg-gray90 hover-opacity-trigger active-bg-green-light`} key={slug}>
            <CircleAvatar size={40} avatar={avatar} className='flex-none' />
            <div className='inline-block pl4' style={{width: '24rem'}}>
              <span className='f-xl gray40 py1'>{name}</span><br />
              <span className='gray60 py1'>{(outlets && outlets.length) ? outlets[0].value : null}</span><br />
              <span className='gray60 py1'>{truncate(outlets.map((o) => o.label).join(', '), 30)}</span>
            </div>
            <div className='flex-none right px4'>
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
