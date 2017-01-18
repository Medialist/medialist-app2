import React, { PropTypes } from 'react'
import ContactSelector from '../feedback/contact-selector'
import { FeedFeedbackIcon, FeedCoverageIcon } from '../images/icons'

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

  getTabClassName (tab) {
    const base = 'inline-block px4 py3 pointer f-sm semibold '
    return base + (this.state.selected === tab ? 'bg-white shadow-2' : 'gray60')
  },

  render () {
    const { contacts, onFeedback, onCoverage, campaign } = this.props
    const { selected, focused } = this.state
    const childProps = { focused, contacts, campaign }

    return (
      <div className='mb2' onFocus={() => this.setState({focused: true})}>
        <nav className='block' style={{padding: '2px 1px 0', height: 50, overflowY: 'hidden'}}>
          <div className={this.getTabClassName('Feedback')} onClick={() => this.setState({ selected: 'Feedback' })} >
            <FeedFeedbackIcon className={selected === 'Feedback' ? 'blue' : 'gray80'} /> Feedback
          </div>
          <div className={this.getTabClassName('Coverage')} onClick={() => this.setState({ selected: 'Coverage' })} >
            <FeedCoverageIcon className={selected === 'Coverage' ? 'blue' : 'gray80'} /> Coverage
          </div>
        </nav>
        <div style={{padding: '0 1px'}}>
          <div className='bg-white shadow-2 p3 pb0'>
            { selected === 'Feedback' ? <FeedbackInput {...childProps} onSubmit={onFeedback} /> : '' }
            { selected === 'Coverage' ? <CoverarageInput {...childProps} onSubmit={onCoverage} /> : '' }
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
    this.props.onSubmit(this.state)
    // TOOD: wire in callback from server.
    setTimeout(() => this.setState({message: '', posting: false}), 1000)
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

const CoverarageInput = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    focused: PropTypes.bool.isRequired,
    campaigns: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    return {message: ''}
  },
  onMessageChange (evt) {
    this.setState({message: evt.target.value})
  },
  render () {
    const {onMessageChange} = this
    const {focused, contact} = this.props
    const {message} = this.state
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'
    const name = contact && contact.name && contact.name.split(' ')[0] || 'you'
    return (<div>
      <textarea
        rows={rows}
        className='textarea mb1' style={{border: '0 none', overflowY: 'scroll', resize: 'none'}}
        placeholder={`Did ${name} post any coverage?`}
        value={message}
        onChange={onMessageChange} />
      <div className={className}>
        <button
          className={`btn bg-gray80 right active-bg-blue ${message.length > 0 ? 'active' : ''}`}
          disabled={message.length < 1}>Post</button>
        <button className='btn bg-transparent border-gray80'>Select a Campaign</button>
      </div>
    </div>)
  }
})

export default PostBox
