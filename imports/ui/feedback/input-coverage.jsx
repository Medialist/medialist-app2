import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CampaignSelector from '/imports/ui/feedback/campaign-selector'
import ContactSelector from '/imports/ui/feedback/contact-selector'
import StatusMap from '/imports/api/contacts/status'
import PostBoxtTextArea from '/imports/ui/feedback/post-box-textarea'
import immutable from 'object-path-immutable'
import PostBoxButtons from './post-box-buttons'
import firstName from '/imports/lib/first-name'

export default class CoverageInput extends Component {
  static propTypes = {
    contact: PropTypes.object,
    campaign: PropTypes.object,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    message: PropTypes.string,
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
      status = StatusMap.completed
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
    this.setState((s) => immutable.set(s, name, value))
    if (name === 'contact' && this.props.isEdit) this.setState({status: value.status})
  }

  onSubmit = () => {
    this.setState({
      posting: true
    })

    this.props.onSubmit(this.state, (err) => {
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

  render () {
    const { message, posting, shouldFocusTextArea, status, campaign, contact } = this.state
    const { focused, isEdit, selectableContacts, selectableCampaigns } = this.props
    const { onFieldChange, onSubmit, onOpenDropDown, onCloseDropDown } = this

    const isCampaignPage = window.location.pathname.split('/')[1] === 'campaign'

    return (
      <div>
        <PostBoxtTextArea
          placeholder={isCampaignPage ? `What's happening with this campaign?` : `What's happening with ${firstName(contact)}?`}
          value={message}
          focused={focused}
          disabled={posting}
          onChange={onFieldChange}
          data-id='coverage-input'
          shouldFocus={shouldFocusTextArea} />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !campaign}
          onPost={onSubmit}
          isEdit={isEdit} >
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
