import React, { PropTypes } from 'react'
import CampaignsFilterableList from '../campaigns/campaigns-filterable-list'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { ChevronDown } from '../images/icons'
import StatusDot from '../feedback/status-dot'

const CampaignFilter = React.createClass({
  propTypes: {
    loading: PropTypes.bool.isRequired,
    contact: PropTypes.object,
    campaigns: PropTypes.array.isRequired,
    onCampaignFilter: PropTypes.func.isRequired
  },
  getInitialState () {
    return {
      open: false,
      selectedFilter: null
    }
  },
  openDropDown () {
    this.setState(({open}) => ({open: true}))
  },
  closeDropdown () {
    this.setState(({open}) => ({open: false}))
  },
  onFilter (campaign) {
    const { contact, campaigns } = this.props
    const name = campaigns.filter((c) => c.slug === campaign.slug).pop().name
    const status = contact ? campaign.contacts[contact.slug] : null
    this.props.onCampaignFilter(campaign)
    this.setState({
      open: false,
      selectedFilter: { status, name }
    })
  },
  onClearFilter () {
    this.props.onCampaignFilter(null)
    this.setState({
      open: false,
      selectedFilter: null
    })
  },
  render () {
    const { open, selectedFilter } = this.state
    const { openDropDown, closeDropdown, onFilter, onClearFilter } = this
    const { loading, contact, campaigns } = this.props
    return (
      <Dropdown>
        <div className='flex-none p3 pointer gray20' onClick={openDropDown}>
          {selectedFilter ? (
            <span className='f-sm semibold flex items-center'>
              {selectedFilter.status && <StatusDot name={selectedFilter.status} size={9} style={{marginTop: 1}} />}
              <div className='ml1'>{selectedFilter.name}</div>
              <ChevronDown className='gray40' />
            </span>
          ) : (
            <span className='f-sm semibold'>All Campaigns <ChevronDown className='gray40' /></span>
          )}
        </div>
        <DropdownMenu left={-73} width={573} open={open} onDismiss={closeDropdown}>
          {loading ? <CampaignsFilterableList contact={contact} campaigns={campaigns} onFilter={onFilter} onClearFilter={onClearFilter} /> : null}
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default CampaignFilter
