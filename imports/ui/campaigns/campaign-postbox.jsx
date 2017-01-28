import React, { PropTypes } from 'react'
import ContactSelector from '../feedback/contact-selector'
import { FeedbackTab, CoverageTab, PostBoxTabs } from '../feedback/post-box-nav'

const PostBox = React.createClass({
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
  isValid () {
    return !!(this.state.status && this.state.contact)
  },
  render () {
    const { onContactChange, onMessageChange, onStatusChange, isValid } = this
    const {focused, contacts, campaign} = this.props
    const {message, posting, contact, status} = this.state
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'

    return (
      <div>
        <textarea
          rows={rows}
          className='textarea mb1'
          style={{border: '0 none', overflowY: 'scroll', resize: 'none'}}
          placeholder={`What's happening with this campaign?`}
          onChange={onMessageChange}
          value={message}
          disabled={posting} />
        <div className={className}>
          <button
            onClick={() => this.onSubmit()}
            className={`btn bg-gray80 right active-bg-blue ${message.length > 0 ? 'active' : ''}`}
            disabled={message.length < 1 || posting || !isValid()}>Post</button>
          <ContactSelector
            selectedContact={contact}
            selectedStatus={status}
            campaign={campaign}
            contacts={contacts}
            onContactChange={onContactChange}
            onStatusChange={onStatusChange} />
        </div>
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
    return {message: '', contact: null}
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
    const {onMessageChange, onContactChange} = this
    const {focused, contacts, campaign} = this.props
    const {message, contact, status, posting} = this.state
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'

    return (
      <div>
        <textarea
          rows={rows}
          className='textarea mb1'
          style={{border: '0 none', overflowY: 'scroll', resize: 'none'}}
          placeholder={'Any coverage for this campaign?'}
          onChange={onMessageChange}
          value={message} />
        <div className={className}>
          <button
            className={`btn bg-gray80 right active-bg-blue ${message.length > 0 ? 'active' : ''}`}
            disabled={message.length < 1 || !contact || posting}
            onClick={this.onSubmit}>Post</button>
          <ContactSelector
            showStatus={false}
            selectedContact={contact}
            selectedStatus={status}
            campaign={campaign}
            contacts={contacts}
            onContactChange={onContactChange}
            />
        </div>
      </div>
    )
  }
})

export default PostBox
