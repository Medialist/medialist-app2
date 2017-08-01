import React from 'react'
import PropTypes from 'prop-types'
import SearchBox from '/imports/ui/lists/search-box'
import CampaignContacts from '/imports/ui/campaigns/campaign-contacts'

const ContactFilterableList = ({ term, onTermChange, campaign, contacts, onSelectContact }) => {
  const styleOverrides = {
    backgroundColor: 'white',
    borderTop: 'solid 0px',
    borderRight: 'solid 0px',
    borderLeft: 'solid 0px'
  }

  return (
    <div>
      <SearchBox
        initialTerm={term}
        onTermChange={onTermChange}
        style={styleOverrides}
        placeholder='Search contacts'
        data-id='contacts-filterable-list-search-input' />
      <div style={{maxHeight: 299, overflowY: 'scroll'}}>
        <CampaignContacts campaign={campaign} contacts={contacts} onSelectContact={onSelectContact} />
      </div>
    </div>
  )
}

ContactFilterableList.propTypes = {
  term: PropTypes.string.isRequired,
  onTermChange: PropTypes.func.isRequired,
  campaign: PropTypes.object,
  contacts: PropTypes.array.isRequired,
  onSelectContact: PropTypes.func.isRequired
}

export default ContactFilterableList
