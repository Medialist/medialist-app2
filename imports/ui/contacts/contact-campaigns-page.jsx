import React from 'react'
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import ContactTopbar from './contact-topbar'
import CampaignSearch from '../campaigns/campaign-search'
import StatusStats from '../contacts/status-stats'
import campaignSearchQueryContainer from '../campaigns/campaign-search-query-container'
import { CircleAvatar } from '../images/avatar'
import EditableAvatar from '../images/editable-avatar'
import Contacts from '/imports/api/contacts/contacts'
import AddContactsToCampaigns from './add-contacts-to-campaign'

const ContactCampaignsPage = React.createClass({
  getInitialState () {
    return {
      addToCampaignOpen: false
    }
  },

  toggleAddToCampaign () {
    this.setState((s) => ({ addToCampaignOpen: !s.addToCampaignOpen }))
  },

  onAvatarChange (e) {
    // const { _id } = this.props.campaign
    // update.call({ _id, avatar: e.url }, (err) => {
    //   if (err) {
    //     console.error('Failed to update campaign avatar', err)
    //     this.props.snackbar.show('There was a problem updating the image.')
    //   }
    // })
  },

  onAvatarError (err) {
    console.error('Failed to change avatar', err)
    this.props.snackbar.show('There was a problem updating the image.')
  },

  render () {
    const {contact, campaigns} = this.props
    if (!contact) return null
    const statuses = campaigns.map((c) => c.contacts[contact.slug])
    const { onAvatarChange, onAvatarError } = this
    const { name, avatar, outlets } = contact
    const { addToCampaignOpen } = this.state
    return (
      <div>
        <ContactTopbar contact={contact} onAddToCampaignClick={this.toggleAddToCampaign} />
        <div className='flex items-center pt4 pb2 pr2 pl6'>
          <div className='flex-auto'>
            <div className='flex items-center'>
              <EditableAvatar avatar={avatar} onChange={onAvatarChange} onError={onAvatarError} menuLeft={0} menuTop={-20}>
                <CircleAvatar className='flex-none' size={40} avatar={avatar} name={name} />
              </EditableAvatar>
              <div className='flex-auto ml3' style={{lineHeight: 1.4}}>
                <div className='f-xl semibold gray10 truncate'>{name}</div>
                <div className='f-sm normal gray10 truncate'>
                  {outlets[0] && outlets[0].value} — {outlets.map((o) => o.label).join(', ')}
                </div>
              </div>
            </div>
          </div>
          <StatusStats className='flex-none' statuses={statuses} onStatusClick={(status) => console.log(status)} />
        </div>
        <CampaignSearch
          {...this.props}
          onTermChange={(term) => this.props.setQuery({term})}
          selections={[]}
        />
        <AddContactsToCampaigns
          title={`Add ${contact.name.split(' ')[0]} to a Campaign`}
          onDismiss={this.toggleAddToCampaign}
          open={addToCampaignOpen}
          contacts={[contact]}
        />
      </div>
    )
  }
})

export default createContainer(({params: { contactSlug }}) => {
  Meteor.subscribe('contact-page', contactSlug)
  const contact = Contacts.findOne({ slug: contactSlug })
  return { contact, contactSlug }
}, campaignSearchQueryContainer(ContactCampaignsPage))
