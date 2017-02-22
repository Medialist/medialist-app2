import React, { PropTypes } from 'react'
import { Dropdown, DropdownMenu } from '../navigation/dropdown'
import { SquareAvatar } from '../images/avatar.jsx'
import SearchBox from '../lists/search-box'
import Status from './status-label'
import { TimeFromNow } from '../time/time'

const Campaign = (props) => {
  const { name, avatar, client, contacts, updatedAt } = props.campaign
  const { slug } = props.contact
  return (
    <div className='flex items-center'>
      <SquareAvatar avatar={avatar} name={name} />
      <div className='flex-auto ml3'>
        <div className='semibold f-md gray10'>{name}</div>
        <div className='normal f-sm gray20'>
          {client && client.name}
          <span className='ml1 gray40'>- updated <TimeFromNow date={updatedAt} /></span>
        </div>
      </div>
      <div className='flex-none' style={{width: 173}}>
        <Status name={contacts[slug]} />
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
    contact: PropTypes.object.isRequired,
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
    const { contact, campaigns } = this.props
    return (
      <div className='inline-block'>
        <Dropdown>
          <button className='btn bg-transparent border-gray80' onClick={this.openDropdown} disabled={!campaigns.length}>
            { campaign ? <CampaignButton campaign={campaign} /> : 'Select a Campaign' }
          </button>
          <DropdownMenu left={-73} width={573} open={this.state.open} onDismiss={this.closeDropdown}>
            <FilterableCampaignsList contact={contact} campaigns={campaigns} onClick={this.onLinkClick} />
          </DropdownMenu>
        </Dropdown>
      </div>
    )
  }
})

const itemMatchesTerm = (item, term) => {
  if (!item) return item
  return item.toLowerCase().substring(0, term.length) === term.toLowerCase()
}

const FilterableCampaignsList = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    campaigns: PropTypes.array,
    onClick: PropTypes.func.isRequired
  },
  getInitialState () {
    return { filteredCampaigns: this.props.campaigns }
  },
  componentWillReceiveProps (props) {
    this.setState({filteredCampaigns: this.props.campaigns})
  },
  onTermChange (term) {
    const { campaigns } = this.props
    let filteredCampaigns = campaigns.filter((c) => itemMatchesTerm(c.name, term))
    if (!filteredCampaigns[0]) filteredCampaigns = campaigns.filter((c) => itemMatchesTerm(c.client.name, term))
    this.setState({ filteredCampaigns })
  },
  render () {
    const { onClick, contact } = this.props
    const { filteredCampaigns } = this.state
    return (
      <nav className='overflow-scroll' style={{height: 331}}>
        <SearchBox onTermChange={this.onTermChange} placeholder='Search campaigns' />
        {filteredCampaigns.map((item) => (
          <div key={item._id} className='px3 py2 pointer border-transparent border-bottom border-top hover-bg-gray90 hover-border-gray80' onClick={() => onClick(item)}>
            <Campaign campaign={item} contact={contact} />
          </div>
        ))}
      </nav>
    )
  }
})

export default CampaignSelector
