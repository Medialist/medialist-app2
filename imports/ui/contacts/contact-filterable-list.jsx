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
    const styleOverrides = {
      backgroundColor: 'white',
      borderTop: 'solid 0px',
      borderRight: 'solid 0px',
      borderLeft: 'solid 0px'
    }
    return (
      <div>
        <SearchBox term={term} onTermChange={onTermChange} style={styleOverrides} placeholder='Search contacts' />
        <div className='overflow-scroll' style={{maxHeight: 299}}>
          <CampaignContacts campaign={campaign} contacts={contacts} onSelectContact={onSelectContact} />
        </div>
      </div>
    )
  }
})
