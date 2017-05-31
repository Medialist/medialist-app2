import React from 'react'
import PropTypes from 'prop-types'
import Topbar from '/imports/ui/navigation/topbar'
import NavLink from '/imports/ui/navigation/nav-link'

class ContactTopbar extends React.Component {
  static propTypes = {
    onAddToCampaignClick: PropTypes.func,
    contact: PropTypes.object,
    location: PropTypes.object.isRequired
  }

  render () {
    const { contact, onAddToCampaignClick, location } = this.props
    if (!contact) return null
    const [page, slug] = location.pathname.split('/').slice(1)
    const activityNavLink = page === 'campaign' ? `/campaign/${slug}/contact/${contact.slug}` : `/contact/${contact.slug}`

    return (
      <Topbar>
        <div className='inline-block border-gray80 border-right'>
          <NavLink to={activityNavLink} onlyActiveOnIndex>Activity</NavLink>
          <NavLink to={`/contact/${contact.slug}/campaigns`}>Campaigns</NavLink>
        </div>
        <div className='px4 py3'>
          <button className='btn white bg-blue mx2' onClick={onAddToCampaignClick}>
            Add <FirstName contact={contact} /> to Campaign
          </button>
        </div>
      </Topbar>
    )
  }
}

const FirstName = ({ contact }) => (
  <span>{contact ? contact.name.split(' ')[0] : 'Unknown'}</span>
)

export default ContactTopbar
