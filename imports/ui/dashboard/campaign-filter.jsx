import React, { PropTypes } from 'react'
import CampaignsFilterableList from '../campaigns/campaigns-filterable-list'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { ChevronDown } from '../images/icons'
import StatusDot from '../feedback/status-dot'

const CampaignFilter = React.createClass({
  propTypes: {
    loading: PropTypes.bool.isRequired,
    contact: PropTypes.object.isRequired,
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
    const status = campaign.contacts[contact.slug]
    this.props.onCampaignFilter(name)
    this.setState({
      open: false,
      selectedFilter: { status, name }
    })
  },
  render () {
    const { open, selectedFilter } = this.state
    const { openDropDown, closeDropdown, onFilter } = this
    const { loading, contact, campaigns } = this.props

    return (
      <Dropdown>
        <div className='flex-none p3 pointer' onClick={openDropDown}>
          {selectedFilter ? (
            <span className='f-sm semibold flex items-center'>
              <StatusDot name={selectedFilter.status} size={9} />
              <div className='ml1'>{selectedFilter.name}</div>
              <ChevronDown />
            </span>
          ) : (
            <span className='f-sm semibold'>All Campaigns <ChevronDown /></span>
          )}
        </div>
        <DropdownMenu left={-73} width={573} open={open} onDismiss={closeDropdown}>
          {loading ? null : <CampaignsFilterableList contact={contact} campaigns={campaigns} onClick={onFilter} />}
        </DropdownMenu>
      </Dropdown>
    )
  }
})

export default CampaignFilter
