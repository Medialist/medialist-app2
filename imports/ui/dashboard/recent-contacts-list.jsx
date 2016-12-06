import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { MenuContactIcon, ChevronRight } from '../images/icons'
import CampaignContact from '../campaigns/campaign-contact'

const RecentContactsList = (props) => {
  const { contacts } = props
  return (
    <section className='block'>
      <header className='clearfix p4 border-gray80 border-bottom'>
        <Link to='/contacts' className='f-sm semibold blue right'>See All<ChevronRight /></Link>
        <h1 className='m0 f-md semibold gray20 left'>
          <MenuContactIcon className='gray60' />
          <span className='ml1'>My Recent Contacts</span>
        </h1>
      </header>
      <div className='pl3'>
        {contacts.map((contact) => <CampaignContact key={contact.slug} {...contact} />)}
      </div>
    </section>
  )
}

RecentContactsList.PropTypes = {
  contacts: PropTypes.array
}

export default RecentContactsList
