import React from 'react'
import PropTypes from 'prop-types'
import { DataDam } from 'react-data-dam'
import SearchBox from '/imports/ui/lists/search-box'
import createSearchContainer from '/imports/ui/campaigns/campaign-search-container'
import { CanJoinCampaignResult } from '/imports/ui/contacts/add-to-campaign/campaign-result'

class CampaignSearch extends React.Component {
  static propTypes = {
    onTermChange: PropTypes.func.isRequired,
    campaigns: PropTypes.array.isRequired,
    onCampaignSelected: PropTypes.func.isRequired,
    renderCampaigns: PropTypes.func.isRequired,
    loading: PropTypes.bool
  }

  static defaultProps = {
    renderCampaigns: (campaigns, onCampaignSelected) => {
      return campaigns.map((c) => (
        <CanJoinCampaignResult {...c} onSelect={onCampaignSelected} key={c._id} />
      ))
    }
  }

  onKeyPress (e) {
    if (e.key !== 'Enter') {
      return
    }

    const { campaigns, onCampaignSelected } = this.props

    if (!campaigns[0]) {
      return
    }

    onCampaignSelected(campaigns[0])
  }

  render () {
    const {
      term,
      campaigns,
      onTermChange,
      onCampaignSelected,
      renderCampaigns,
      loading
    } = this.props
    const searching = !!term
    return (
      <DataDam data={campaigns} flowing={loading}>
        {(campaigns) => (
          <div>
            <SearchBox
              initialTerm={term}
              onTermChange={onTermChange}
              onKeyPress={this.onKeyPress}
              placeholder='Search campaigns'
              data-id='search-input' />
            <div style={{height: '413px', overflowY: 'auto'}}>
              <div data-id={`${searching ? 'search-results' : 'unfiltered'}`}>
                { renderCampaigns(campaigns, onCampaignSelected) }
              </div>
            </div>
          </div>
        )}
      </DataDam>
    )
  }
}

const WrappedCampaignSearch = createSearchContainer(CampaignSearch)

class CampaignSearchContainer extends React.Component {
  state = {
    term: ''
  }

  onTermChange = (term) => {
    this.setState({ term })
  }

  render () {
    return <WrappedCampaignSearch {...this.props} limit={20} term={this.state.term} onTermChange={this.onTermChange} />
  }
}

export default CampaignSearchContainer
