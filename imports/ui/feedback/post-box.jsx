import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PostBoxtTextArea from '/imports/ui/feedback/post-box-textarea'
import FeedbackInput from '/imports/ui/feedback/input-feedback'
import CoverageInput from '/imports/ui/feedback/input-coverage'
import PostBoxButtons from '/imports/ui/feedback/post-box-buttons'
import { FeedbackTab, CoverageTab, NeedToKnowTab, PostBoxTabs } from '/imports/ui/feedback/post-box-nav'
import immutable from 'object-path-immutable'
import firstName from '/imports/lib/first-name'

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
    return {
      focused: false,
      selected: 'Feedback'
    }
  },

  onFeedback (details, callback) {
    this.props.onFeedback(details, (error) => {
      if (!error) {
        this.setState({focused: false})
      }

      callback(error)
    })
  },

  onCoverage (details, callback) {
    this.props.onCoverage(details, (error) => {
      if (!error) {
        this.setState({focused: false})
      }

      callback(error)
    })
  },

  onNeedToKnow (details, callback) {
    this.props.onNeedToKnow(details, (error) => {
      if (!error) {
        this.setState({focused: false})
      }

      callback(error)
    })
  },

  render () {
    const { selected, focused } = this.state
    const { contact, campaigns, loading } = this.props
    const campaign = this.props.campaign || campaigns[0]
    if (loading) return null
    const childProps = { focused, contact, selectableCampaigns: campaigns }
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
            { selected === 'Feedback' && <FeedbackInput {...childProps} campaigns={campaigns} campaign={campaign} onSubmit={(details, callback) => this.onFeedback(details, callback)} /> }
            { selected === 'Coverage' && <CoverageInput {...childProps} campaigns={campaigns} campaign={campaign} onSubmit={(details, callback) => this.onCoverage(details, callback)} /> }
            { selected === 'Need to Know' && <NeedToKnowInput {...childProps} onSubmit={(details, callback) => this.onNeedToKnow(details, callback)} /> }
          </div>
        </div>
      </div>
    )
  }
})

export class NeedToKnowInput extends Component {
  static propTypes = {
    contact: PropTypes.object,
    focused: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    isEdit: PropTypes.bool
  }

  state = {
    message: this.props.message || '',
    posting: false
  }

  onFieldChange = (event) => {
    const { name, value } = event.target
    this.setState((s) => immutable.set(s, name, value))
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

  render () {
    return (
      <div>
        <PostBoxtTextArea
          placeholder={`Share something important to know about ${firstName(this.props.contact)}`}
          value={this.state.message}
          focused={this.props.focused}
          disabled={this.state.posting}
          onChange={this.onFieldChange}
          data-id='need-to-know-input'
          shouldFocus />
        <PostBoxButtons
          focused={this.props.focused}
          disabled={!this.state.message || this.state.posting}
          onPost={this.onSubmit}
          isEdit={this.props.isEdit} >
          <button style={{padding: '7px 15px'}} className='btn bg-transparent border-gray80 bold'>B</button>
          <button style={{padding: '7px 15px'}} className='btn bg-transparent border-gray80 italic ml3'>i</button>
        </PostBoxButtons>
      </div>
    )
  }
}

export default PostBox
