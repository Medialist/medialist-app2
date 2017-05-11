import React from 'react'
import PropTypes from 'prop-types'
import { ChevronDown } from '../images/icons'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { SquareAvatar } from '../images/avatar'
import CampaignsFilterableList from '../campaigns/campaigns-filterable-list'

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
    onChange: PropTypes.func.isRequired
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
  },
  closeDropdown () {
    this.setState({
      open: false
    })
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
    return (
      <div className='inline-block'>
        <Dropdown>
          <button
            style={{padding: '6px 15px 6px'}}
            className='btn bg-transparent border-gray80' onClick={this.openDropdown}
            disabled={!this.props.campaigns.length}
            data-id='select-campaign-button'>
            { this.state.campaign ? <CampaignButton campaign={this.state.campaign} /> : 'Select a Campaign' }
          </button>
          <DropdownMenu left={-73} width={573} arrowAlign='left' arrowMarginLeft='155px' open={this.state.open} onDismiss={this.closeDropdown}>
            <CampaignsFilterableList
              contact={this.props.contact}
              campaigns={this.props.campaigns}
              onFilter={this.onLinkClick}
              onClearFilter={this.onClearFilter}
              hideAllFilter />
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }
})

export default CampaignSelector
