import React, { PropTypes } from 'react'
import Dropdown from 'rebass/dist/Dropdown'
import DropdownMenu from '../lists/dropdown-menu'
import { SquareAvatar } from '../images/avatar.jsx'
import { dropdownMenuStyle } from '../common-styles'

const dropdownStyle = Object.assign({}, dropdownMenuStyle, { width: 223 })

const Campaign = (props) => {
  const { name, avatar, client } = props.campaign
  return (
    <div>
      <SquareAvatar avatar={avatar} name={name} />
      <div className='inline-block ml3 align-middle'>
        <div className='semibold f-md gray10'>{name}</div>
        <div className='normal f-sm gray20'>{client && client.name}</div>
      </div>
    </div>
  )
}

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
    campaigns: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
  },
  getInitialState () {
    return {open: false, campaign: null}
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
  render () {
    const { campaign } = this.state
    const { campaigns } = this.props
    return (
      <div className='inline-block'>
        <Dropdown>
          <button className='btn bg-transparent border-gray80 mx2' onClick={this.openDropdown} disabled={!campaigns.length}>
            { campaign ? <CampaignButton campaign={campaign} /> : 'Select a Campaign' }
          </button>
          <DropdownMenu right style={dropdownStyle} open={this.state.open} onDismiss={this.closeDropdown}>
            <nav className='py1'>
              {campaigns.map((item) => (
                <div key={item._id} className='px3 py2 pointer hover-bg-gray90' onClick={() => this.onLinkClick(item)}>
                  <Campaign campaign={item} />
                </div>
              ))}
            </nav>
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }
})

export default CampaignSelector
