import React, { PropTypes } from 'react'
import StatusSelector from '../feedback/status-selector'
import CampaignSelector from '../feedback/campaign-selector'
import { FeedFeedbackIcon, FeedCoverageIcon, FeedNeedToKnowIcon } from '../images/icons'

const FeedbackInput = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    campaigns: PropTypes.array.isRequired,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    return {message: '', status: null, campaign: null, posting: false}
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
    this.props.onSubmit(this.state)
    // TOOD: wire in callback from server.
    setTimeout(() => this.setState({message: '', posting: false}), 1000)
  },
  isValid () {
    return !!(this.state.status && this.state.campaign)
  },
  render () {
    const {focused, contact, campaigns} = this.props
    const {message, status, posting} = this.state
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'
    const name = contact && contact.name && contact.name.split(' ')[0]
    return (
      <div>
        <textarea
          rows={rows}
          className='textarea mb1'
          style={{border: '0 none'}}
          placeholder={`Any updates on ${name}'s work?`}
          onChange={this.onMessageChange}
          value={message}
          disabled={posting} />
        <div className={className}>
          <button onClick={() => this.onSubmit()} className='btn bg-gray80 right' disabled={posting || !this.isValid()}>Post</button>
          <CampaignSelector onChange={this.onCampaignChange} campaigns={campaigns} />
          <div className='inline-block mx2'>
            <StatusSelector status={status} onChange={this.onStatusChange} />
          </div>
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
  render () {
    const {focused, contact} = this.props
    const className = focused ? '' : 'display-none'
    const rows = focused ? '3' : '1'
    const name = contact && contact.name && contact.name.split(' ')[0]
    return (<div>
      <textarea rows={rows} className='textarea mb1' style={{border: '0 none'}} placeholder={`Did ${name} post any coverage?`} />
      <div className={className}>
        <button className='btn bg-gray80 right'>Post</button>
        <button className='btn bg-transparent border-gray80'>Select a Campaign</button>
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

const PostBox = React.createClass({
  propTypes: {
    campaigns: PropTypes.array.isRequired,
    contact: PropTypes.object,
    onFeedback: PropTypes.func.isRequired,
    onCoverage: PropTypes.func.isRequired,
    onNeedToKnow: PropTypes.func.isRequired
  },

  getInitialState () {
    return { focused: false, selected: 'Feedback' }
  },

  getTabClassName (tab) {
    const base = 'inline-block px4 py3 pointer f-sm semibold '
    return base + (this.state.selected === tab ? 'bg-white shadow-2' : 'gray60')
  },

  render () {
    const { contact, campaigns, onFeedback, onCoverage, onNeedToKnow } = this.props
    const { selected, focused } = this.state
    const childProps = { focused, contact }

    return (
      <div className='mb2' onFocus={() => this.setState({focused: true})}>
        <nav className='block' style={{padding: '2px 1px 0', height: 50, overflowY: 'hidden'}}>
          <div className={this.getTabClassName('Feedback')} onClick={() => this.setState({ selected: 'Feedback' })} >
            <FeedFeedbackIcon /> Feedback
          </div>
          <div className={this.getTabClassName('Coverage')} onClick={() => this.setState({ selected: 'Coverage' })} >
            <FeedCoverageIcon /> Coverage
          </div>
          <div className={this.getTabClassName('Need to Know')} onClick={() => this.setState({ selected: 'Need to Know' })} >
            <FeedNeedToKnowIcon /> Need to Know
          </div>
        </nav>
        <div style={{padding: '0 1px'}}>
          <div className='bg-white shadow-2 p3 pb0'>
            { selected === 'Feedback' ? <FeedbackInput {...childProps} campaigns={campaigns} onSubmit={onFeedback} /> : '' }
            { selected === 'Coverage' ? <CoverarageInput {...childProps} campaigns={campaigns} onSubmit={onCoverage} /> : '' }
            { selected === 'Need to Know' ? <NeedToKnowInput {...childProps} onSubmit={onNeedToKnow} /> : '' }
          </div>
        </div>
      </div>
    )
  }
})

export default PostBox
