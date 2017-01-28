import React, { PropTypes } from 'react'
import CampaignSelector from './campaign-selector'
import { FeedbackTab, CoverageTab, NeedToKnowTab } from '../feedback/post-box-nav'

const PostBox = React.createClass({
  propTypes: {
    campaigns: PropTypes.array,
    contact: PropTypes.object,
    contacts: PropTypes.array,
    onFeedback: PropTypes.func,
    onCoverage: PropTypes.func,
    onNeedToKnow: PropTypes.func
  },

  getInitialState () {
    return { focused: false, selected: 'Feedback' }
  },

  render () {
    const { contact, contacts, campaigns, onFeedback, onCoverage, onNeedToKnow } = this.props
    const { selected, focused } = this.state
    const childProps = { focused, contact, contacts }

    return (
      <div className='mb2' onFocus={() => this.setState({focused: true})}>
        <nav className='block' style={{padding: '2px 1px 0', height: 50, overflowY: 'hidden'}}>
          <FeedbackTab onClick={() => this.setState({selected: 'Feedback'})} selected={selected === 'Feedback'} />
          <CoverageTab onClick={() => this.setState({selected: 'Coverage'})} selected={selected === 'Coverage'} />
          <NeedToKnowTab onClick={() => this.setState({selected: 'Need to Know'})} selected={selected === 'Need to Know'} />
        </nav>
        <div style={{padding: '0 1px'}}>
          <div className='bg-white shadow-2 p3 pb0'>
            { selected === 'Feedback' && <FeedbackInput {...childProps} campaigns={campaigns} onSubmit={onFeedback} /> }
            { selected === 'Coverage' && <CoverarageInput {...childProps} campaigns={campaigns} onSubmit={onCoverage} /> }
            { selected === 'Need to Know' && <NeedToKnowInput {...childProps} onSubmit={onNeedToKnow} /> }
          </div>
        </div>
      </div>
    )
  }
})

const FeedbackInput = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    campaigns: PropTypes.array,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    const campaign = this.props.campaigns && this.props.campaigns[0]
    return {message: '', status: null, campaign, posting: false}
  },
  onMessageChange (evt) {
    this.setState({message: evt.target.value})
  },
  onCampaignChange (campaign) {
    this.setState({campaign: campaign})
  },
  onStatusChange (status) {
    this.setState({status: status})
  },
  onSubmit () {
    this.setState({posting: true})
    this.props.onSubmit(this.state, (err) => {
      this.setState({message: '', posting: false})
      if (err) console.error(err)
    })
  },
  isValid () {
    return !!(this.state.status && this.state.campaign)
  },
  render () {
    const { onCampaignChange, onMessageChange } = this
    const {focused, contact, campaigns} = this.props
    const {message, posting} = this.state
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'
    const name = contact && contact.name && contact.name.split(' ')[0]

    return (
      <div>
        <textarea
          rows={rows}
          className='textarea mb1'
          style={{border: '0 none', overflowY: 'scroll', resize: 'none'}}
          placeholder={contact ? `Any updates on ${name}'s work?` : `What's happening with this campaign?`}
          onChange={onMessageChange}
          value={message}
          disabled={posting} />
        <div className={className}>
          <button
            onClick={() => this.onSubmit()}
            className={`btn bg-gray80 right active-bg-blue ${message.length > 0 ? 'active' : ''}`}
            disabled={message.length < 1 || posting || this.isValid()}>Post</button>
          <CampaignSelector onChange={onCampaignChange} campaigns={campaigns} />
        </div>
      </div>
    )
  }
})

const CoverarageInput = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    focused: PropTypes.bool,
    campaigns: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    return {message: ''}
  },
  onMessageChange (evt) {
    this.setState({message: evt.target.value})
  },
  onCampaignChange (campaign) {
    this.setState({ campaign })
  },
  onSubmit () {
    this.setState({posting: true})
    this.props.onSubmit(this.state, (err) => {
      this.setState({message: '', posting: false})
      if (err) console.error(err)
    })
  },
  render () {
    const {onMessageChange, onCampaignChange, onSubmit} = this
    const {focused, contact, campaigns} = this.props
    const {message, campaign, posting} = this.state
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
          disabled={message.length < 1 || !campaign || posting}
          onClick={onSubmit}>Post</button>
        <CampaignSelector onChange={onCampaignChange} campaigns={campaigns} />
      </div>
    </div>)
  }
})

const NeedToKnowInput = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  render () {
    const {focused, contact} = this.props
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'
    const name = contact && contact.name && contact.name.split(' ')[0]
    return (
      <div>
        <textarea rows={rows} className='textarea mb1' style={{border: '0 none'}} placeholder={`Share something important to know about ${name}`} />
        <div className={className}>
          <button className='btn bg-gray80 right'>Post</button>
          <button className='btn bg-transparent border-gray80 bold'>B</button>
          <button className='btn bg-transparent border-gray80 italic mx2'>i</button>
        </div>
      </div>)
  }
})

export default PostBox
