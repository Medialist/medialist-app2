import React, { PropTypes } from 'react'
import SearchBox from '../lists/search-box'
import Campaign from '../campaigns/campaign-list-item'

const itemMatchesTerm = (item, term) => {
  if (!item) return
  return item.toLowerCase().substring(0, term.length) === term.toLowerCase()
}

const CampaignsFilterableList = React.createClass({
  propTypes: {
    contact: PropTypes.object.isRequired,
    campaigns: PropTypes.array,
    onClick: PropTypes.func.isRequired
  },
  getInitialState () {
    return { filteredCampaigns: this.props.campaigns || [] }
  },
  componentWillReceiveProps (props) {
    this.setState({ filteredCampaigns: props.campaigns })
  },
  onTermChange (term) {
    const { campaigns } = this.props
    const filteredCampaigns = campaigns.filter((c) => itemMatchesTerm(c.name, term) || itemMatchesTerm(c.client.name, term))
    this.setState({ filteredCampaigns })
  },
  render () {
    const { onClick, contact } = this.props
    const { filteredCampaigns } = this.state
    const styleOverrides = {borderTop: 'solid 0px', borderRight: 'solid 0px', borderLeft: 'solid 0px'}
    return (
      <nav className='overflow-scroll' style={{height: 331}}>
        <SearchBox onTermChange={this.onTermChange} placeholder='Search campaigns' style={styleOverrides} />
        {filteredCampaigns.map((item) => (
          <div key={item._id} className='px3 py2 pointer border-transparent border-bottom border-top hover-bg-gray90 hover-border-gray80' onClick={() => onClick(item)}>
            <Campaign campaign={item} contact={contact} />
          </div>
        ))}
      </nav>
    )
  }
})

export default CampaignsFilterableList
