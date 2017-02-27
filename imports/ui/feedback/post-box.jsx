import React, { PropTypes } from 'react'
import StatusMap from '/imports/api/contacts/status'
import CampaignSelector from './campaign-selector'
import StatusSelector from './status-selector.jsx'
import { FeedbackTab, CoverageTab, NeedToKnowTab, PostBoxTabs } from '../feedback/post-box-nav'

const PostBox = React.createClass({
  propTypes: {
    loading: PropTypes.bool.isRequired,
    contact: PropTypes.object,
    campaigns: PropTypes.array,
    onFeedback: PropTypes.func.isRequired,
    onCoverage: PropTypes.func.isRequired,
    onNeedToKnow: PropTypes.func.isRequired
  },

  getInitialState () {
    return { focused: false, selected: 'Feedback' }
  },

  render () {
    const { contact, campaigns, onFeedback, onCoverage, onNeedToKnow, loading } = this.props
    const { selected, focused } = this.state
    const childProps = { focused, contact }
    if (!contact || loading) return null
    return (
      <div className='mb2' onFocus={() => this.setState({focused: true})}>
        <PostBoxTabs>
          <FeedbackTab onClick={() => this.setState({selected: 'Feedback'})} selected={selected === 'Feedback'} />
          <CoverageTab onClick={() => this.setState({selected: 'Coverage'})} selected={selected === 'Coverage'} />
          <NeedToKnowTab onClick={() => this.setState({selected: 'Need to Know'})} selected={selected === 'Need to Know'} />
        </PostBoxTabs>
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

export const PostBoxtTextArea = ({placeholder, value, focused, disabled, onChange}) => (
  <textarea
    rows={focused ? '3' : '1'}
    className='textarea mb1'
    style={{border: '0 none', overflowY: 'auto', resize: 'none', paddingLeft: '3px'}}
    placeholder={placeholder}
    onChange={onChange}
    value={value}
    disabled={disabled} />
)

export const PostBoxButtons = ({focused, disabled, onPost, children}) => (
  <div style={{display: focused ? null : 'none'}}>
    <button
      onClick={onPost}
      className={`btn bg-gray80 right active-bg-blue ${disabled ? '' : 'active'}`}
      disabled={disabled}>
      Post
    </button>
    {children}
  </div>
)

const FeedbackInput = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    campaigns: PropTypes.array,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    const { contact, campaigns } = this.props
    const campaign = campaigns && campaigns[0]
    const contactRef = campaign && campaign.contacts[contact.slug]
    const status = contactRef || StatusMap.toContact
    return {status, campaign, message: '', posting: false}
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
  render () {
    const {onCampaignChange, onStatusChange, onMessageChange, onSubmit} = this
    const {focused, contact, campaigns} = this.props
    const {message, posting, status, campaign} = this.state
    const name = contact && contact.name && contact.name.split(' ')[0]
    return (
      <div>
        <PostBoxtTextArea
          placeholder={`What's happening with ${name || 'this contact'}?`}
          value={message}
          focused={focused}
          disabled={posting}
          onChange={onMessageChange} />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !status || !campaign}
          onPost={onSubmit} >
          <CampaignSelector contact={contact} onChange={onCampaignChange} campaigns={campaigns} />
          <StatusSelector className='ml3' status={status} onChange={onStatusChange} border />
        </PostBoxButtons>
      </div>
    )
  }
})

// Defaults the status to completed. User can change it.
const CoverarageInput = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    focused: PropTypes.bool,
    campaigns: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    const { campaigns } = this.props
    const campaign = campaigns && campaigns[0]
    const status = StatusMap.completed
    return {status, campaign, message: '', posting: false}
  },
  onStatusChange (status) {
    this.setState({status: status})
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
    const {onCampaignChange, onStatusChange, onMessageChange, onSubmit} = this
    const {focused, contact, campaigns} = this.props
    const {message, posting, status, campaign} = this.state
    const name = contact && contact.name && contact.name.split(' ')[0]
    return (
      <div>
        <PostBoxtTextArea
          placeholder={`Has ${name || 'this contact'} shared any coverage?`}
          value={message}
          focused={focused}
          disabled={posting}
          onChange={onMessageChange} />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !campaign}
          onPost={onSubmit} >
          <CampaignSelector contact={contact} onChange={onCampaignChange} campaigns={campaigns} />
          <StatusSelector className='ml3' status={status} onChange={onStatusChange} border />
        </PostBoxButtons>
      </div>
    )
  }
})

const NeedToKnowInput = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    return {message: '', posting: false}
  },
  onMessageChange (evt) {
    this.setState({message: evt.target.value})
  },
  onSubmit () {
    this.setState({posting: true})
    this.props.onSubmit(this.state, (err) => {
      this.setState({message: '', posting: false})
      if (err) console.error(err)
    })
  },
  render () {
    const {onSubmit, onMessageChange} = this
    const {message, posting} = this.state
    const {focused, contact} = this.props
    const name = contact && contact.name && contact.name.split(' ')[0]
    return (
      <div>
        <PostBoxtTextArea
          placeholder={`Share something important to know about ${name}`}
          value={message}
          focused={focused}
          disabled={posting}
          onChange={onMessageChange} />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting}
          onPost={onSubmit} >
          <button style={{padding: '7px 15px'}} className='btn bg-transparent border-gray80 bold'>B</button>
          <button style={{padding: '7px 15px'}} className='btn bg-transparent border-gray80 italic ml3'>i</button>
        </PostBoxButtons>
      </div>
    )
  }
})

export default PostBox
