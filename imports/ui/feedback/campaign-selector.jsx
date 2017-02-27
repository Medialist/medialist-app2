import React, { PropTypes } from 'react'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { SquareAvatar } from '../images/avatar.jsx'
import CampaignsFilterableList from '../campaigns/campaigns-filterable-list'

const CampaignButton = (props) => {
  const { name, avatar } = props.campaign
  return (
    <div style={{margin: '-1px 0 -1px -4px'}} className='align-left'>
      <SquareAvatar size={20} avatar={avatar} name={name} />
      <div className='inline-block ml2 align-middle f-sm normal gray10'>{name}</div>
    </div>
  )
}

const CampaignSelector = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    campaigns: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
  },
  getInitialState () {
    const { campaigns } = this.props
    const campaign = campaigns && campaigns[0]
    return {open: false, campaign}
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
          <button className='btn bg-transparent border-gray80' onClick={openDropdown} disabled={!campaigns.length}>
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
