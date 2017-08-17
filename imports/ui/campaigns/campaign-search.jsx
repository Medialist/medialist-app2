import React from 'react'
import PropTypes from 'prop-types'
import { LoadingBar } from '/imports/ui/lists/loading'
import SearchBox, { SearchBoxCount } from '/imports/ui/lists/search-box'
import CampaignsTable from '/imports/ui/campaigns/campaigns-table'
import CountTag from '/imports/ui/tags/tag'

const CampaignSearch = ({
  onTermChange,
  selectedTags,
  onTagRemove,
  term,
  sort,
  campaigns,
  campaignsCount,
  selections,
  selectionMode,
  contact,
  onSortChange,
  onSelectionsChange,
  onSelectionModeChange,
  loading,
  searching
}) => (
  <div>
    <div className='bg-white shadow-2 m4' data-id='campaigns-table'>
      <div className='pt4 pl4 pr4 pb1 items-center'>
        <SearchBox initialTerm={term} onTermChange={onTermChange} placeholder='Search campaigns...' data-id='search-campaigns-input' style={{zIndex: 1}}>
          {selectedTags && selectedTags.map((t) => (
            <CountTag
              style={{marginBottom: 0}}
              key={t.slug}
              name={t.name}
              count={t.contactsCount}
              onRemove={() => onTagRemove(t)}
            />
          ))}
        </SearchBox>
        <SearchBoxCount type='campaign' loading={loading} total={campaignsCount} />
      </div>
      <CampaignsTable
        term={term}
        sort={sort}
        campaigns={campaigns}
        selections={selections}
        selectionMode={selectionMode}
        contact={contact}
        onSortChange={onSortChange}
        onSelectionsChange={onSelectionsChange}
        onSelectionModeChange={onSelectionModeChange}
        searching={Boolean(term)} />
    </div>
    { loading && <LoadingBar /> }
  </div>
)

CampaignSearch.propTypes = {
  onTermChange: PropTypes.func.isRequired,
  selectedTags: PropTypes.array,
  onTagRemove: PropTypes.func.isRequired,
  term: PropTypes.string,
  sort: PropTypes.object,
  campaigns: PropTypes.array.isRequired,
  campaignsCount: PropTypes.number,
  selections: PropTypes.array,
  contact: PropTypes.object,
  onSortChange: PropTypes.func.isRequired,
  onSelectionsChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  searching: PropTypes.bool.isRequired
}

export default CampaignSearch
