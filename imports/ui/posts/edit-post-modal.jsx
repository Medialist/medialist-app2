import React from 'react'
import PropTypes from 'prop-types'
import { createContainer } from 'meteor/react-meteor-data'
import { CampaignContacts } from '/imports/ui/campaigns/collections'
import Campaigns from '/imports/api/campaigns/campaigns'
import Modal from '/imports/ui/navigation/modal'
import withSnackbar from '/imports/ui/snackbar/with-snackbar'
import { NeedToKnowInput } from '/imports/ui/feedback/post-box'
import FeedbackInput from '/imports/ui/feedback/input-feedback'
import CoverageInput from '/imports/ui/feedback/input-coverage'

class EditPost extends React.Component {
  static propTypes = {
    contact: PropTypes.object,
    campaign: PropTypes.object,
    open: PropTypes.bool.isRequired,
    post: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired
  }

  state = {
    value: this.props.post.message || ''
  }

  onChange = (e) => {
    const { value } = e.target
    this.setState({ value })
  }

  render () {
    const { post } = this.props
    const { _id, icon, type, contacts, campaigns } = post

    const Component = {
      'FeedbackPost': FeedbackInput,
      'CoveragePost': CoverageInput,
      'NeedToKnowPost': NeedToKnowInput
    }[type]

    return (
      <div data-id='edit-post-modal'>
        <div className='p3 border-gray80 border-bottom'>
          {icon}<span className='mx1'>Edit</span>{type.replace(/Post/g, '')}
        </div>
        <div className='p3'>
          <Component
            {...post}
            selectableContacts={this.props.selectableContacts}
            selectableCampaigns={this.props.selectableCampaigns}
            contact={contacts && contacts[0]}
            campaign={campaigns && campaigns[0]}
            onSubmit={this.props.onUpdate.bind(null, _id)}
            focused
            isEdit />
        </div>
      </div>
    )
  }
}

const EditPostWithSnackBar = withSnackbar(EditPost)

const EditPostModal = Modal(EditPostWithSnackBar, { width: 675, overflowY: 'visible' })

export default createContainer(({open, contact, campaign}) => {
  if (!open) return {}

  const data = {}

  if (campaign) {
    data.selectableContacts = CampaignContacts.find({
      campaign: campaign.slug
    }, {
      sort: {
        updatedAt: -1
      }
    }).fetch()
  } else if (contact) {
    data.selectableCampaigns = Campaigns.find({
      slug: {
        $in: contact.campaigns
      }
    }, {
      sort: {
        updatedAt: -1
      }
    }).fetch()
  }

  return data
}, EditPostModal)
