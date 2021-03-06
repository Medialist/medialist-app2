import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { MenuContactIcon, ChevronRight } from '/imports/ui/images/icons'
import ContactPreview from '/imports/ui/contacts/contact-preview'

const ContactPreviewsList = (props) => {
  const { contacts } = props
  return (
    <section className='block' data-id='recent-contacts-list'>
      <header className='clearfix p4 border-gray80 border-bottom'>
        <Link to='/contacts' className='f-sm semibold blue right'>See All <ChevronRight className='ml1' /></Link>
        <h1 className='m0 f-md semibold gray20 left'>
          <MenuContactIcon className='gray60' />
          <span className='ml1'>My Recent Contacts</span>
        </h1>
      </header>
      <div className='p3'>
        {contacts.map((contact) => (
          <Link to={`/contact/${contact.slug}`} key={contact.slug} className='block mb2'>
            <ContactPreview contact={contact} />
          </Link>
        ))}
        {!contacts.length && (
          <Link
            to='/contacts?createContact=true'
            className='block py1 pl1 underline semibold blue'
            style={{ marginLeft: '21px' }}
            title='Create a new contact'>
              Create a new contact
          </Link>
        )}
      </div>
    </section>
  )
}

ContactPreviewsList.PropTypes = {
  contacts: PropTypes.array
}

export default ContactPreviewsList
