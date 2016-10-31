import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { CircleAvatar } from '../images/avatar'

const CampaignContact = (props) => (
  <div className='pt3' style={{lineHeight: 1.3}}>
    <CircleAvatar className='inline-block' size={38} avatar={props.avatar} name={props.name} />
    <div className='inline-block align-top pl3' style={{width: 220, height: 55}}>
      <div className='f-md semibold gray10 truncate'>{props.name}</div>
      <div className='f-sm normal gray20 truncate'>{props.jobTitles}</div>
      <div className='f-sm normal gray40 truncate'>{props.primaryOutlets}</div>
    </div>
  </div>
)

const CampaignContactList = React.createClass({
  propTypes: {
    campaign: PropTypes.object,
    contacts: PropTypes.array
  },

  render () {
    const { contacts, campaign } = this.props
    if (!contacts || !campaign) return null
    return (
      <aside className='bg-white mb4 p4 shadow-2'>
        <header className='border-gray80 border-bottom'>
          <h1 className='m0 pb4'>
            <span className='pill f-xs bg-blue'>{contacts.length}</span>
            <span className='f-md semibold gray20 ml2'>Contacts</span>
          </h1>
        </header>
        <div className='pb3'>
          {contacts.map((contact) => <CampaignContact {...contact} />)}
        </div>
        <footer className='center border-gray80 border-top pt3'>
          <Link to={`/campaign/${campaign.slug}/contacts`} className='block blue'>Show all</Link>
        </footer>
      </aside>
    )
  }
})

export default CampaignContactList
