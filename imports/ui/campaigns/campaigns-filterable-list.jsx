import React from 'react'
import PropTypes from 'prop-types'
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
    onClearFilter: PropTypes.func,
    hideAllFilter: PropTypes.bool
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
    const { onFilter, contact, onClearFilter, hideAllFilter } = this.props
    const { filteredCampaigns } = this.state
    const allCampaignCount = this.props.campaigns.length
    const styleOverrides = {
      backgroundColor: 'white',
      borderTop: 'solid 0px',
      borderRight: 'solid 0px',
      borderLeft: 'solid 0px'
    }
    return (
      <nav>
        <SearchBox
          onTermChange={this.onTermChange}
          placeholder='Search campaigns'
          style={styleOverrides}
          data-id='campaigns-filterable-list-search-input' />
        {!hideAllFilter &&
          <div className='f-sm semibold p3 pointer hover-bg-gray90 hover-box-shadow-x-gray80' onClick={onClearFilter}>
            All campaigns ({allCampaignCount})
          </div>
        }
        <div style={{maxHeight: 278, overflowY: 'auto'}}>
          {filteredCampaigns.map((item, i) => (
            <div
              key={item._id}
              className={`px3 py2 pointer hover-bg-gray90 hover-box-shadow-x-gray80`}
              onClick={() => onFilter(item)}
              data-type='campaign-search-result'
              data-id={`campaign-${item._id}`}>
              <Campaign campaign={item} contact={contact} />
            </div>
          ))}
        </div>
      </nav>
    )
  }
})

export default CampaignsFilterableList
