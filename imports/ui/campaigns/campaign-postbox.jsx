import React, { PropTypes } from 'react'
import ContactSelector from '../feedback/contact-selector'
import { PostBoxtTextArea, PostBoxButtons } from '../feedback/post-box'
import { FeedbackTab, CoverageTab, PostBoxTabs } from '../feedback/post-box-nav'

const CampaignPostBox = React.createClass({
  propTypes: {
    campaign: PropTypes.object.isRequired,
    contacts: PropTypes.array.isRequired,
    onFeedback: PropTypes.func.isRequired,
    onCoverage: PropTypes.func.isRequired
  },

  getInitialState () {
    return { focused: false, selected: 'Feedback' }
  },

  render () {
    const { contacts, onFeedback, onCoverage, campaign } = this.props
    const { selected, focused } = this.state
    const childProps = { focused, contacts, campaign }

    return (
      <div className='mb2' onFocus={() => this.setState({focused: true})}>
        <PostBoxTabs>
          <FeedbackTab onClick={() => this.setState({selected: 'Feedback'})} selected={selected === 'Feedback'} />
          <CoverageTab onClick={() => this.setState({selected: 'Coverage'})} selected={selected === 'Coverage'} />
        </PostBoxTabs>
        <div style={{padding: '0 1px'}}>
          <div className='bg-white shadow-2 p3 pb0'>
            { selected === 'Feedback' && <FeedbackInput {...childProps} onSubmit={onFeedback} /> }
            { selected === 'Coverage' && <CoverageInput {...childProps} onSubmit={onCoverage} /> }
          </div>
        </div>
      </div>
    )
  }
})

const FeedbackInput = React.createClass({
  propTypes: {
    campaign: PropTypes.object.isRequired,
    contacts: PropTypes.array.isRequired,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    return {message: '', status: null, contact: null, posting: false}
  },
  onMessageChange (evt) {
    this.setState({message: evt.target.value})
  },
  onContactChange (contact) {
    const status = this.props.campaign.contacts[contact.slug]
    this.setState({contact, status})
  },
  onStatusChange (status) {
    this.setState({status})
  },
  onSubmit () {
    this.setState({posting: true})
    this.props.onSubmit(this.state, (err) => {
      this.setState({message: '', posting: false})
      if (err) console.error(err)
    })
  },
  render () {
    const {onContactChange, onMessageChange, onStatusChange, onSubmit} = this
    const {focused, contacts, campaign} = this.props
    const {message, posting, contact, status} = this.state

    return (
      <div>
        <PostBoxtTextArea
          placeholder={'What\'s happening with this campaign?'}
          value={message}
          focused={focused}
          disabled={posting}
          onChange={onMessageChange}
        />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !status || !contact}
          onPost={onSubmit} >
          <ContactSelector
            selectedContact={contact}
            selectedStatus={status}
            campaign={campaign}
            contacts={contacts}
            onContactChange={onContactChange}
            onStatusChange={onStatusChange} />
        </PostBoxButtons>
      </div>
    )
  }
})

const CoverageInput = React.createClass({
  propTypes: {
    campaign: PropTypes.object.isRequired,
    contacts: PropTypes.array.isRequired,
    focused: PropTypes.bool.isRequired
  },
  getInitialState () {
    return {message: '', contact: null, posting: false}
  },
  onMessageChange (evt) {
    this.setState({message: evt.target.value})
  },
  onContactChange (contact) {
    const status = this.props.campaign.contacts[contact.slug]
    this.setState({contact, status})
  },
  onSubmit () {
    this.setState({posting: true})
    this.props.onSubmit(this.state, (err) => {
      this.setState({message: '', posting: false})
      if (err) console.error(err)
    })
  },
  render () {
    const {onMessageChange, onContactChange, onSubmit} = this
    const {focused, contacts, campaign} = this.props
    const {message, contact, status, posting} = this.state
    return (
      <div>
        <PostBoxtTextArea
          placeholder={'Any coverage for this campaign?'}
          value={message}
          focused={focused}
          disabled={posting}
          onChange={onMessageChange}
        />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !contact}
          onPost={onSubmit} >
          <ContactSelector
            showStatus={false}
            selectedContact={contact}
            selectedStatus={status}
            campaign={campaign}
            contacts={contacts}
            onContactChange={onContactChange}
            />
        </PostBoxButtons>
      </div>
    )
  }
})

export default CampaignPostBox
