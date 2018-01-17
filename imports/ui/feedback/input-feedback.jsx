import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CampaignSelector from '/imports/ui/feedback/campaign-selector'
import ContactSelector from '/imports/ui/feedback/contact-selector'
import PostBoxtTextArea from '/imports/ui/feedback/post-box-textarea'
import immutable from 'object-path-immutable'
import PostBoxButtons from './post-box-buttons'
import firstName from '/imports/lib/first-name'
import StatusMap from '/imports/api/contacts/status'

export default class FeedbackInput extends Component {
  static propTypes = {
    contact: PropTypes.object,
    campaign: PropTypes.object,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    message: PropTypes.string,
    status: PropTypes.string,
    isEdit: PropTypes.bool,
    selectableContacts: PropTypes.array,
    selectableCampaigns: PropTypes.array
  }

  constructor (props) {
    super(props)

    const {
      contact,
      campaign,
      message,
      status
    } = props

    this.state = {
      contact,
      status,
      campaign,
      message: message || '',
      posting: false,
      shouldFocusTextArea: true
    }
  }

  onFieldChange = (event) => {
    const { name, value } = event.target
    this.setState(state => immutable.set(state, name, value))
    // update the status if the contact changes to the contact's status
    if (name === 'contact' && this.props.isEdit) this.setState({status: value.status})
  }

  onSubmit = () => {
    this.setState({
      posting: true
    })

    const data = { ...this.state, status: this.getContactStatus() }

    this.props.onSubmit(data, (err) => {
      this.setState({
        message: '',
        posting: false
      })

      if (err) {
        console.error(err)
      }
    })
  }

  onOpenDropDown = () => {
    this.setState({
      shouldFocusTextArea: false
    })
  }

  onCloseDropDown = () => {
    this.setState({
      shouldFocusTextArea: true
    })
  }

  // Get contact status from state, if the user has chosen something
  // otherwise, from campaign specific status
  // otherwise, defaulting to "To Contact"
  getContactStatus () {
    if (this.state.status) return this.state.status

    const { contact, campaign } = this.state
    let status

    if (campaign && contact) {
      const contactRef = (campaign.contacts || []).find(c => c.slug === contact.slug)
      status = contactRef && contactRef.status
    }

    console.log({ contact, campaign, status })

    return status || StatusMap.toContact
  }

  render () {
    const { message, posting, shouldFocusTextArea, campaign, contact } = this.state
    const { focused, isEdit, selectableContacts, selectableCampaigns } = this.props
    const { onFieldChange, onSubmit, onOpenDropDown, onCloseDropDown } = this

    const isCampaignPage = window.location.pathname.split('/')[1] === 'campaign'
    const status = this.getContactStatus()

    return (
      <div>
        <PostBoxtTextArea
          placeholder={isCampaignPage ? `What's happening with this campaign?` : `What's happening with ${firstName(contact)}?`}
          value={message}
          focused={focused}
          disabled={posting}
          onChange={onFieldChange}
          data-id='feedback-input'
          shouldFocus={shouldFocusTextArea} />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !status || !campaign}
          onPost={onSubmit}
          isEdit={isEdit}>
          {isCampaignPage ? (
            <ContactSelector
              isEdit={isEdit}
              selectedContact={contact}
              selectedStatus={status}
              campaign={campaign}
              contacts={selectableContacts}
              onContactChange={onFieldChange}
              onStatusChange={onFieldChange}
              onOpen={onOpenDropDown}
              onClose={onCloseDropDown} />
          ) : (
            <CampaignSelector
              isEdit={isEdit}
              campaign={campaign}
              selectedStatus={status}
              contact={contact}
              onChange={onFieldChange}
              campaigns={selectableCampaigns}
              onOpen={onOpenDropDown}
              onClose={onCloseDropDown} />
          )}
        </PostBoxButtons>
      </div>
    )
  }
}
