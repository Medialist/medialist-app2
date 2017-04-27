import React from 'react'
import PropTypes from 'prop-types'
import ContactSelector from '../feedback/contact-selector'
import { PostBoxButtons } from '../feedback/post-box'
import PostBoxTextArea from '../feedback/post-box-textarea'
import { FeedbackTab, CoverageTab, PostBoxTabs } from '../feedback/post-box-nav'
import immutable from 'object-path-immutable'

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
      <div className='pb3' onFocus={() => this.setState({focused: true})} data-id='post-box'>
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
    return {
      message: '',
      contact: null,
      status: null,
      posting: false
    }
  },
  onFieldChange (event) {
    const { name, value } = event.target
    this.setState((s) => immutable.set(s, name, value))

    if (name === 'contact') {
      const status = this.props.campaign.contacts[value.slug]

      this.setState({
        status
      })
    }
  },
  onSubmit () {
    this.setState({
      posting: true
    })

    this.props.onSubmit(this.state, (error) => {
      this.setState(this.getInitialState())

      if (error) {
        console.error(error)
      }
    })
  },
  render () {
    const {focused, contacts, campaign} = this.props
    const {message, posting, contact, status} = this.state

    return (
      <div>
        <PostBoxTextArea
          placeholder={'What\'s happening with this campaign?'}
          value={message}
          focused={focused}
          disabled={posting}
          onChange={this.onFieldChange}
          data-id='feedback-input'
        />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !status || !contact}
          onPost={this.onSubmit} >
          <ContactSelector
            selectedContact={contact}
            selectedStatus={status}
            campaign={campaign}
            contacts={contacts}
            onContactChange={this.onFieldChange}
            onStatusChange={this.onFieldChange} />
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
    return {
      message: '',
      contact: null,
      posting: false,
      status: null
    }
  },
  onFieldChange (event) {
    const { name, value } = event.target
    this.setState((s) => immutable.set(s, name, value))

    if (name === 'contact') {
      const status = this.props.campaign.contacts[value.slug]

      this.setState({
        status
      })
    }
  },
  onSubmit () {
    this.setState({
      posting: true
    })

    this.props.onSubmit(this.state, (error) => {
      this.setState(this.getInitialState())

      if (error) {
        console.error(error)
      }
    })
  },
  render () {
    const {focused, contacts, campaign} = this.props
    const {message, contact, status, posting} = this.state
    return (
      <div>
        <PostBoxTextArea
          placeholder={'Any coverage for this campaign?'}
          value={message}
          focused={focused}
          disabled={posting}
          onChange={this.onFieldChange}
          data-id='coverage-input'
        />
        <PostBoxButtons
          focused={focused}
          disabled={!message || posting || !contact}
          onPost={this.onSubmit} >
          <ContactSelector
            selectedContact={contact}
            selectedStatus={status}
            campaign={campaign}
            contacts={contacts}
            onContactChange={this.onFieldChange}
            onStatusChange={this.onFieldChange}
            />
        </PostBoxButtons>
      </div>
    )
  }
})

export default CampaignPostBox
