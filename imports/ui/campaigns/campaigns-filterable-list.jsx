import React, { PropTypes } from 'react'
import SearchBox from '../lists/search-box'
import Campaign from '../campaigns/campaign-list-item'

const itemMatchesTerm = (item, term) => {
  if (!item) return
  return item.toLowerCase().substring(0, term.length) === term.toLowerCase()
}

const CampaignsFilterableList = React.createClass({
  propTypes: {
    contact: PropTypes.object,
    campaigns: PropTypes.array,
    onFilter: PropTypes.func.isRequired,
    onClearFilter: PropTypes.func
  },
  getInitialState () {
    return { filteredCampaigns: this.props.campaigns || [] }
  },
  componentWillReceiveProps (props) {
    this.setState({ filteredCampaigns: props.campaigns })
  },
  onTermChange (term) {
    const { campaigns } = this.props
    const filteredCampaigns = campaigns.filter((c) => {
      let itemMatch = itemMatchesTerm(c.name, term)
      if (!itemMatch && c.client && c.client.name) itemMatch = itemMatchesTerm(c.client.name, term)
      return itemMatch
    })
    this.setState({ filteredCampaigns })
  },
  render () {
    const { onFilter, contact, onClearFilter } = this.props
    const { filteredCampaigns } = this.state
    const styleOverrides = {
      backgroundColor: 'white',
      borderTop: 'solid 0px',
      borderRight: 'solid 0px',
      borderLeft: 'solid 0px'
    }
    return (
      <nav>
        <SearchBox onTermChange={this.onTermChange} placeholder='Search campaigns' style={styleOverrides} />
        <div className='f-sm semibold p3 bg-gray90 border-bottom border-gray80 pointer' onClick={onClearFilter}>All campaigns ({filteredCampaigns.length})</div>
        <div style={{maxHeight: 278, overflowY: 'auto'}}>
          {filteredCampaigns.map((item, i) => (
            <div
              key={item._id}
              className={`px3 py2 pointer border-transparent border-bottom ${i !== 0 ? 'border-top' : ''} hover-bg-gray90 hover-border-gray80`}
              onClick={() => onFilter(item)}>
              <Campaign campaign={item} contact={contact} />
            </div>
          ))}
        </div>
      </nav>
    )
  }
})

export default CampaignsFilterableList
