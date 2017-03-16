import React, { PropTypes } from 'react'
import StatusSelector from './status-selector'
import { createFeedbackPost } from '/imports/api/posts/methods'

const StatusSelectorContainer = React.createClass({
  propTypes: {
    contactSlug: PropTypes.string.isRequired,
    campaign: PropTypes.object.isRequired
  },

  onStatusChange (status) {
    const { contactSlug, campaign } = this.props
    createFeedbackPost.call({contactSlug, campaignSlug: campaign.slug, status})
  },

  render () {
    const { contactSlug, campaign } = this.props
    const status = campaign.contacts[contactSlug]
    return <StatusSelector status={status} onChange={this.onStatusChange} />
  }
})

export default StatusSelectorContainer
