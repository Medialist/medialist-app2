import React from 'react'
import PropTypes from 'prop-types'
import SearchBox from '/imports/ui/lists/search-box'
import Campaign from '/imports/ui/campaigns/campaign-list-item'

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
    return { filteredCampaigns: this.props.campaigns || [], term: '' }
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
    this.setState({ filteredCampaigns, term })
  },
  render () {
    const { onFilter, contact, onClearFilter, hideAllFilter } = this.props
    const { filteredCampaigns, term } = this.state
    const allCampaignCount = this.props.campaigns.length
    const styleOverrides = {
      borderTop: 'solid 0px',
      borderRight: 'solid 0px',
      borderLeft: 'solid 0px'
    }
    return (
      <nav>
        <SearchBox
          initialTerm={term}
          onTermChange={this.onTermChange}
          placeholder='Search campaigns'
          style={styleOverrides}
          data-id='campaigns-filterable-list-search-input' />
        {!hideAllFilter &&
          <div className='f-sm semibold p3 pointer hover-bg-gray90 hover-box-shadow-x-gray80 mt2' onClick={onClearFilter}>
            All campaigns ({allCampaignCount})
          </div>
        }
        <div style={{maxHeight: 278, overflowY: 'auto'}} className='mt2'>
          {filteredCampaigns.map((item, i) => (
            <div
              key={item._id}
              className={`px3 py2 pointer hover-bg-gray90 hover-box-shadow-x-gray80`}
              onClick={() => onFilter(item)}
              data-type='campaign-search-result'
              data-id={`campaign-${item.slug}`}>
              <Campaign campaign={item} contact={contact} />
            </div>
          ))}
        </div>
      </nav>
    )
  }
})

export default CampaignsFilterableList
