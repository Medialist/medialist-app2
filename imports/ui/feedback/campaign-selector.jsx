import React from 'react'
import PropTypes from 'prop-types'
import { ChevronDown } from '/imports/ui/images/icons'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'
import { SquareAvatar } from '/imports/ui/images/avatar'
import CampaignsFilterableList from '/imports/ui/campaigns/campaigns-filterable-list'
import StatusSelector from '/imports/ui/feedback/status-selector'
import StatusLabel from '/imports/ui/feedback/status-label'

const CampaignButton = (props) => {
  return (
    <div className='flex align-left' style={{maxWidth: 160}}>
      <SquareAvatar className='flex-none' size={20} avatar={props.campaign.avatar} name={props.campaign.name} />
      <div className='flex-auto truncate ml2 align-middle f-sm normal gray10'>{props.campaign.name}</div>
      <ChevronDown className='flex-none ml1 gray40' />
    </div>
  )
}

const CampaignSelector = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    campaigns: PropTypes.array.isRequired,
    campaign: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onStatusChange: PropTypes.func.isRequired,
    onOpen: PropTypes.func,
    onClose: PropTypes.func
  },
  getInitialState () {
    return {
      open: false,
      campaign: this.props.campaign || (this.props.campaigns && this.props.campaigns[0])
    }
  },
  openDropdown () {
    this.setState({
      open: true
    })

    if (this.props.onOpen) {
      this.props.onOpen()
    }
  },
  closeDropdown () {
    this.setState({
      open: false
    })

    if (this.props.onClose) {
      this.props.onClose()
    }
  },
  onLinkClick (campaign) {
    this.setState({
      open: false,
      campaign: campaign
    })

    this.props.onChange({
      target: {
        name: 'campaign',
        value: campaign
      }
    })

    if (this.props.onClose) {
      this.props.onClose()
    }
  },
  onClearFilter () {
    this.props.onChange({
      target: {
        name: 'campaign',
        value: null
      }
    })
  },
  render () {
    const { openDropdown, closeDropdown, onLinkClick, onClearFilter } = this
    const { campaigns, contact, onStatusChange } = this.props
    const { campaign, open } = this.state
    const { status } = campaign.contacts.find(c => c.slug === contact.slug)

    return (
      <div className='inline-block'>
        <div className='inline-block'>
          <Dropdown>
            <button
              style={{padding: '6px 15px 6px'}}
              className='btn bg-transparent border-gray80' onClick={openDropdown}
              disabled={!campaigns.length}
              data-id='select-campaign-button'>
              { campaign ? <CampaignButton campaign={campaign} /> : 'Select a Campaign' }
            </button>
            <DropdownMenu left={-73} width={573} arrowAlign='left' arrowMarginLeft='155px' open={open} onDismiss={closeDropdown}>
              <CampaignsFilterableList
                contact={contact}
                campaigns={campaigns}
                onFilter={onLinkClick}
                onClearFilter={onClearFilter}
                hideAllFilter />
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className='ml1 inline-block'>
          <StatusSelector
            buttonStyle={{padding: '6px 15px 7px'}}
            status={status}
            onChange={onStatusChange}
            disabled={!contact}>
            <StatusLabel name={status} />
          </StatusSelector>
        </div>
      </div>
    )
  }
})

export default CampaignSelector
