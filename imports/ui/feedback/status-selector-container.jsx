import React from 'react'
import PropTypes from 'prop-types'
import StatusSelector from '/imports/ui/feedback/status-selector'
import { createFeedbackPost } from '/imports/api/posts/methods'

class StatusSelectorContainer extends React.Component {
  static propTypes = {
    contact: PropTypes.object.isRequired,
    campaign: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired,
    compact: PropTypes.bool,
    dropdown: PropTypes.shape({
      left: PropTypes.number,
      width: PropTypes.number,
      arrowAlign: PropTypes.string,
      arrowMarginRight: PropTypes.string,
      arrowMarginLeft: PropTypes.string
    })
  }

  onStatusChange = (event) => {
    createFeedbackPost.call({
      contactSlug: this.props.contact.slug,
      campaignSlug: this.props.campaign.slug,
      status: event.target.value
    })
  }

  render () {
    const { contact, children, compact, ...props } = this.props

    return (
      <StatusSelector
        {...props}
        status={contact.status}
        onChange={this.onStatusChange}
        children={children(contact.status)}
        compact={compact}
        dropdown={this.props.dropdown}
      />
    )
  }
}

export default StatusSelectorContainer
