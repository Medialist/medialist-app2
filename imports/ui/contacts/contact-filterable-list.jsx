import React, { PropTypes } from 'react'
import SearchBox from '../lists/search-box'
import CampaignContacts from '../campaigns/campaign-contacts'

export default React.createClass({
  propTypes: {
    term: PropTypes.string.isRequired,
    onTermChange: PropTypes.func.isRequired,
    campaign: PropTypes.object,
    contacts: PropTypes.array.isRequired,
    onSelectContact: PropTypes.func.isRequired
  },
  render () {
    const { term, onTermChange, campaign, contacts, onSelectContact } = this.props
    return (
      <div>
        <SearchBox term={term} onTermChange={onTermChange} />
        <div className='overflow-scroll' style={{maxHeight: 307}}>
          <CampaignContacts campaign={campaign} contacts={contacts} onSelectContact={onSelectContact} />
        </div>
      </div>
    )
  }
})
