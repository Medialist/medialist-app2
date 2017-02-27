import React, { PropTypes } from 'react'
import { ChevronDown } from '../images/icons'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { SquareAvatar } from '../images/avatar.jsx'
import CampaignsFilterableList from '../campaigns/campaigns-filterable-list'

const CampaignButton = (props) => {
  const { name, avatar } = props.campaign
  return (
    <div className='flex align-left' style={{maxWidth: 160}}>
      <SquareAvatar className='flex-none' size={20} avatar={avatar} name={name} />
      <div className='flex-auto truncate ml2 align-middle f-sm normal gray10'>{name}</div>
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
    const { campaigns, campaign } = this.props
    return {
      open: false,
      campaign: campaign || (campaigns && campaigns[0])
    }
  },
  openDropdown () {
    this.setState({open: true})
  },
  closeDropdown () {
    this.setState({open: false})
  },
  onLinkClick (campaign) {
    this.setState({open: false, campaign: campaign})
    this.props.onChange(campaign)
  },
  onClearFilter () {
    this.props.onChange(null)
  },
  render () {
    const { onLinkClick, closeDropdown, openDropdown, onClearFilter } = this
    const { campaign } = this.state
    const { contact, campaigns } = this.props
    return (
      <div className='inline-block'>
        <Dropdown>
          <button
            style={{padding: '6px 15px 6px'}}
            className='btn bg-transparent border-gray80' onClick={openDropdown}
            disabled={!campaigns.length}>
            { campaign ? <CampaignButton campaign={campaign} /> : 'Select a Campaign' }
          </button>
          <DropdownMenu left={-73} width={573} open={this.state.open} onDismiss={closeDropdown}>
            <CampaignsFilterableList contact={contact} campaigns={campaigns} onFilter={onLinkClick} onClearFilter={onClearFilter} />
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }
})

export default CampaignSelector
