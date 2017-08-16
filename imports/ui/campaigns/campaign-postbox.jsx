import React from 'react'
import PropTypes from 'prop-types'
import FeedbackInput from '/imports/ui/feedback/input-feedback'
import CoverageInput from '/imports/ui/feedback/input-coverage'
import { FeedbackTab, CoverageTab, PostBoxTabs } from '/imports/ui/feedback/post-box-nav'

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

  render () {
    const { contacts, campaign } = this.props
    const { selected, focused } = this.state
    const childProps = { focused, selectableContacts: contacts, campaign }

    return (
      <div className='pb3' onFocus={() => this.setState({focused: true})} data-id='post-box'>
        <PostBoxTabs>
          <FeedbackTab onClick={() => this.setState({selected: 'Feedback'})} selected={selected === 'Feedback'} />
          <CoverageTab onClick={() => this.setState({selected: 'Coverage'})} selected={selected === 'Coverage'} />
        </PostBoxTabs>
        <div style={{padding: '0 1px'}}>
          <div className='bg-white shadow-2 p3 pb0'>
            { selected === 'Feedback' && <FeedbackInput {...childProps} onSubmit={(details, callback) => this.onFeedback(details, callback)} /> }
            { selected === 'Coverage' && <CoverageInput {...childProps} onSubmit={(details, callback) => this.onCoverage(details, callback)} /> }
          </div>
        </div>
      </div>
    )
  }
})

export default CampaignPostBox
