import React from 'react'
import PropTypes from 'prop-types'
import CampaignsFilterableList from '/imports/ui/campaigns/campaigns-filterable-list'
import { Dropdown, DropdownMenu } from '/imports/ui/navigation/dropdown'
import { ChevronDown } from '/imports/ui/images/icons'
import StatusDot from '/imports/ui/feedback/status-dot'

const CampaignFilter = React.createClass({
  propTypes: {
    disabled: PropTypes.bool,
    loading: PropTypes.bool.isRequired,
    contact: PropTypes.object,
    campaigns: PropTypes.array.isRequired,
    onCampaignFilter: PropTypes.func.isRequired
  },
  getInitialState () {
    return {
      open: false,
      campaign: null,
      status: null
    }
  },
  closeDropdown () {
    this.setState({open: false})
  },
  toggleDropdown () {
    if (this.props.disabled) return
    this.setState((s) => ({open: !s.open}))
  },
  onFilter (campaign) {
    const { contact } = this.props
    const status = contact ? campaign.contacts[contact.slug] : null
    this.props.onCampaignFilter(campaign)
    this.setState({
      open: false,
      campaign,
      status
    })
  },
  onClearFilter () {
    this.props.onCampaignFilter(null)
    this.setState({
      open: false,
      campaign: null,
      status: null
    })
  },
  render () {
    const { open, campaign, status } = this.state
    const { closeDropdown, onFilter, onClearFilter, toggleDropdown } = this
    const { loading, contact, campaigns, disabled } = this.props
    return (
      <Dropdown>
        <div className={`flex-none p3 pointer gray20 ${disabled ? 'opacity-50' : ''}`} onClick={toggleDropdown}>
          {campaign ? (
            <span className={`f-sm semibold select-none ${open ? 'blue' : ''}`}>
              {status && <StatusDot name={status} size={9} style={{verticalAlign: 0}} />}
              <div className='ml1 truncate inline-block' style={{maxWidth: 200, verticalAlign: -3}}>{campaign.name}</div>
              <ChevronDown className={`ml1 inline-block ${open ? 'blue' : 'gray40'}`} />
            </span>
          ) : (
            <span className={`f-sm semibold select-none ${open && 'blue'}`}>
              All campaigns
              <ChevronDown className={`ml1 ${open ? 'blue' : 'gray40'}`} />
            </span>
          )}
        </div>
        <DropdownMenu top={-16} left={-73} width={573} arrowAlign='left' arrowMarginLeft='125px' open={open} onDismiss={closeDropdown}>
          {loading ? null : <CampaignsFilterableList contact={contact} campaigns={campaigns} onFilter={onFilter} onClearFilter={onClearFilter} />}
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default CampaignFilter
