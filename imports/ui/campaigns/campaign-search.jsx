import React from 'react'
import Loading from '../lists/loading'
import SearchBox from '../lists/search-box'
import CampaignsTable from './campaigns-table'
import CountTag from '../tags/tag'

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
  loading
}) => (
  <div>
    <div className='bg-white shadow-2 m4 mt8'>
      <div className='p4 flex items-center'>
        <div className='flex-auto'>
          <SearchBox onTermChange={onTermChange} placeholder='Search campaigns...'>
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
        </div>
        <div className='flex-none pl4 f-xs'>
          <div>{total} campaign{total === 1 ? '' : 's'} total</div>
        </div>
      </div>
      <CampaignsTable
        term={term}
        sort={sort}
        campaigns={campaigns}
        selections={selections}
        contactSlug={contactSlug}
        onSortChange={onSortChange}
        onSelectionsChange={onSelectionsChange} />
    </div>
    { loading && <div className='center p4'><Loading /></div> }
  </div>
)

export default CampaignSearch
