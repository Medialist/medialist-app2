import React from 'react'
import PropTypes from 'prop-types'
import Loading from '/imports/ui/lists/loading'
import SearchBox from '/imports/ui/lists/search-box'
import CampaignsTable from '/imports/ui/campaigns/campaigns-table'
import CountTag from '/imports/ui/tags/tag'

const CampaignsTotal = ({ searching, results, total }) => {
  const num = searching ? results.length : total
  return <div className='f-xs gray60' style={{position: 'relative', top: -35, right: 20, textAlign: 'right', zIndex: 0}}>{num} campaign{num === 1 ? '' : 's'}</div>
}

const CampaignSearch = ({
  onTermChange,
  selectedTags,
  onTagRemove,
  total,
  term,
  sort,
  campaigns,
  selections,
  contactSlug,
  onSortChange,
  onSelectionsChange,
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
        <CampaignsTotal searching={searching} results={campaigns} total={total} />
      </div>
      <CampaignsTable
        term={term}
        sort={sort}
        campaigns={campaigns}
        selections={selections}
        contactSlug={contactSlug}
        onSortChange={onSortChange}
        onSelectionsChange={onSelectionsChange}
        searching={Boolean(term)} />
    </div>
    { loading && <div className='center p4'><Loading /></div> }
  </div>
)

CampaignSearch.propTypes = {
  onTermChange: PropTypes.func.isRequired,
  selectedTags: PropTypes.array,
  onTagRemove: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  term: PropTypes.string,
  sort: PropTypes.object,
  campaigns: PropTypes.array.isRequired,
  selections: PropTypes.array,
  contactSlug: PropTypes.string,
  onSortChange: PropTypes.func.isRequired,
  onSelectionsChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  searching: PropTypes.bool.isRequired
}

export default CampaignSearch
