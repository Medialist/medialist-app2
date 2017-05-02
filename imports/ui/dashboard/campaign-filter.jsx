import React from 'react'
import PropTypes from 'prop-types'
import CampaignsFilterableList from '../campaigns/campaigns-filterable-list'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { ChevronDown } from '../images/icons'
import StatusDot from '../feedback/status-dot'

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
            <span className={`f-sm semibold flex items-center select-none ${open ? 'blue' : ''}`}>
              {status && <StatusDot name={status} size={9} style={{marginTop: 1}} />}
              <div className='ml1 truncate' style={{maxWidth: 200}}>{campaign.name}</div>
              <ChevronDown className={open ? 'blue' : 'gray40'} />
            </span>
          ) : (
            <span className={`f-sm semibold flex items-center select-none ${open && 'blue'}`}>
              All campaigns <ChevronDown className={open ? 'blue' : 'gray40'} />
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
