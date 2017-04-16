import React, { PropTypes } from 'react'
import CampaignSelector from './campaign-selector'
import StatusMap from '/imports/api/contacts/status'
import StatusLabel from './status-label'
import StatusSelector from './status-selector'
import PostBoxtTextArea from './post-box-textarea'
import { FeedbackTab, CoverageTab, NeedToKnowTab, PostBoxTabs } from '../feedback/post-box-nav'

const Divider = ({show}) => (
  <div style={{width: 1, height: 14}} className={`inline-block align-middle ${show ? 'bg-gray80' : ''}`} />
)

const PostBox = React.createClass({
  propTypes: {
    loading: PropTypes.bool.isRequired,
    contact: PropTypes.object,
    campaign: PropTypes.object,
    campaigns: PropTypes.array,
    onFeedback: PropTypes.func.isRequired,
    onCoverage: PropTypes.func.isRequired,
    onNeedToKnow: PropTypes.func.isRequired
  },

  getInitialState () {
    return { focused: false, selected: 'Feedback' }
  },

  render () {
    const { selected, focused } = this.state
    const { contact, campaigns, onFeedback, onCoverage, onNeedToKnow, loading } = this.props
    const campaign = this.props.campaign || campaigns[0]
    if (loading) return null
    const childProps = { focused, contact }
    return (
      <div className='pb3' onFocus={() => this.setState({focused: true})} data-id='post-box'>
        <PostBoxTabs>
          <FeedbackTab onClick={() => this.setState({selected: 'Feedback'})} selected={selected === 'Feedback'} />
          <Divider show={selected === 'Need to Know'} />
          <CoverageTab onClick={() => this.setState({selected: 'Coverage'})} selected={selected === 'Coverage'} />
          <Divider show={selected === 'Feedback'} />
          <NeedToKnowTab onClick={() => this.setState({selected: 'Need to Know'})} selected={selected === 'Need to Know'} />
        </PostBoxTabs>
        <div style={{padding: '0 1px'}}>
          <div className='bg-white shadow-2 p3 pb0'>
            { selected === 'Feedback' && <FeedbackInput {...childProps} campaigns={campaigns} campaign={campaign} onSubmit={onFeedback} /> }
            { selected === 'Coverage' && <CoverarageInput {...childProps} campaigns={campaigns} campaign={campaign} onSubmit={onCoverage} /> }
            { selected === 'Need to Know' && <NeedToKnowInput {...childProps} onSubmit={onNeedToKnow} /> }
          </div>
        </div>
      </div>
    )
  }
})

export const PostBoxButtons = ({focused, disabled, onPost, children}) => (
  <div style={{display: focused ? null : 'none'}}>
    <button
      onClick={onPost}
      className={`btn opacity-100 bg-gray80 right active-bg-blue ${disabled ? 'white' : 'active'}`}
      disabled={disabled}
      data-id='create-post-button'>
      Post
    </button>
    {children}
  </div>
)

const FeedbackInput = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    campaigns: PropTypes.array,
    campaign: PropTypes.object,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    const { contact, campaign } = this.props
    const contactRef = campaign && campaign.contacts[contact.slug]
    const status = contactRef || StatusMap.toContact
    return {
      status,
      campaign,
      message: '',
      posting: false
    }
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
          onChange={onMessageChange}
          data-id='feedback-input' />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !status || !campaign}
          onPost={onSubmit} >
          <CampaignSelector contact={contact} onChange={onCampaignChange} campaigns={campaigns} campaign={campaign} />
          <div className='ml3 inline-block'>
            <StatusSelector
              className='btn bg-transparent border-gray80'
              style={{padding: '6px 15px 7px'}}
              status={status}
              onChange={onStatusChange}
            >
              <StatusLabel name={status} />
            </StatusSelector>
          </div>
        </PostBoxButtons>
      </div>
    )
  }
})

// Defaults the status to completed. User can change it.
const CoverarageInput = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    campaign: PropTypes.object,
    focused: PropTypes.bool,
    campaigns: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired
  },
  getInitialState () {
    const { campaign } = this.props
    return {
      status: StatusMap.completed,
      campaign,
      message: '',
      posting: false
    }
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
          onChange={onMessageChange}
          data-id='coverage-input' />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !campaign}
          onPost={onSubmit} >
          <CampaignSelector contact={contact} onChange={onCampaignChange} campaigns={campaigns} campaign={campaign} />
          <div className='ml3 inline-block'>
            <StatusSelector
              className='btn bg-transparent border-gray80'
              style={{padding: '6px 15px 7px'}}
              status={status}
              onChange={onStatusChange}
            >
              <StatusLabel name={status} />
            </StatusSelector>
          </div>
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
          onChange={onMessageChange}
          data-id='need-to-know-input' />
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
